/**
 * Project: @resnovas/smartcloud
 * File: action.ts
 * Path: \src\action.ts
 * Created Date: Monday, September 5th 2022
 * Author: Jonathan Stevens
 * -----
 * Last Modified: Sun Sep 25 2022
 * Modified By: Jonathan Stevens
 * Current Version: 1.0.0-beta.0
 * -----
 * Copyright (c) 2022 Resnovas - All Rights Reserved
 * -----
 * LICENSE: GNU General Public License v3.0 or later (GPL-3.0+)
 *
 * This program has been provided under confidence of the copyright holder and is
 * licensed for copying, distribution and modification under the terms of
 * the GNU General Public License v3.0 or later (GPL-3.0+) published as the License,
 * or (at your option) any later version of this license.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License v3.0 or later for more details.
 *
 * You should have received a copy of the GNU General Public License v3.0 or later
 * along with this program. If not, please write to: jonathan@resnovas.com ,
 * or see https://www.gnu.org/licenses/gpl-3.0-standalone.html
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE - PLEASE SEE THE LICENSE FILE FOR DETAILS
 * -----
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */

/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable n/prefer-global/process */
/* eslint-disable @typescript-eslint/no-require-imports */

import * as core from '@actions/core';
import {context as Context} from '@actions/github';
import {LoggingDataClass, LoggingLevels} from '@resnovas/utilities';
import type {
	CurContext,
} from './conditions';
import {Issues, Project, PullRequests, Schedule} from './contexts';
import {Utils} from './utils';
import {log} from './logging';
import type {Options, Github, Config, SharedConfigIndex, Runners, Label} from './types';

let local: any;
let context = Context;

try {
	// eslint-disable-next-line unicorn/prefer-module
	local = require('../config.json');
	process.env.GITHUB_REPOSITORY = local.GITHUB_REPOSITORY;
	process.env.GITHUB_REPOSITORY_OWNER = local.GITHUB_REPOSITORY_OWNER;
	if (!context.payload.issue && !context.payload.pull_request) {
		// eslint-disable-next-line unicorn/prefer-module
		context = require(local.github_context);
	}
} catch {}

export default class Action {
	client: Github;
	opts: Options;
	configJson: Options['configJson'];
	configPath: Options['configPath'];
	configRef: Options['configRef'];
	dryRun: Options['dryRun'];
	fillEmpty: Options['fillEmpty'];
	repo = context.repo || {};
	util: Utils;
	ref?: string;

	constructor(client: Github, options: Options) {
		core.startGroup('Setup Phase');
		this.client = client;
		this.opts = options;
		this.dryRun = options.dryRun;
		if (this.dryRun) {
			if (options.repo) {
				this.repo = options.repo;
			}

			if (!options.repo?.repo) {
				this.repo.repo = process.env.GITHUB_REPOSITORY ?? 'Unknown';
			}

			if (!options.repo?.owner) {
				this.repo.owner = process.env.GITHUB_REPOSITORY_OWNER ?? 'Unknown';
			}
		}

		this.configJson = options.configJson;
		this.configPath = options.configPath;
		this.configRef = options.configRef;
		this.fillEmpty = options.fillEmpty;
		this.ref = options.ref ?? context.ref;
		this.util = new Utils(
			{client, repo: this.repo},
			{dryRun: options.dryRun, skipDelete: options.skipDelete, ref: this.ref},
			{
				git: options.git,
			},
		);
	}

	async run() {
		await log(LoggingLevels.debug, `Repo data: ${this.repo.owner}/${this.repo.repo}`);

		/**
		 * Capture and log context to debug for Local Running
		 * @author TGTGamer
		 * @since 1.0.0
		 */
		await log(
			LoggingLevels.debug,
			`Context for local running. See readme.md for information on how to setup local running: ${JSON.stringify(
				context,
			)}`,
		);
		/**
		 * Process the config
		 * @author TGTGamer
		 * @since 1.1.0
		 */
		const configs = await this.processConfig().catch(async error => {
			await log(
				LoggingLevels.error,
				'Error thrown while processing config: ' + String(error),
			);
			throw new Error('Error thrown while processing config: ' + String(error));
		});
		if (!configs.runners[0]) {
			await log(LoggingLevels.error, 'No config data.');
			throw new Error('No config data.');
		}

		await log(LoggingLevels.debug, `Config: ${JSON.stringify(configs)}`);

		if (configs.labels) {
			/**
			 * Syncronise the labels
			 * @author TGTGamer
			 * @since 1.1.0
			 */
			core.startGroup('label Actions');
			await log(LoggingLevels.debug, 'Attempting to apply labels');
			await this.syncLabels(configs).catch(async error => {
				await log(
					LoggingLevels.debug,
					'Error thrown while syncronising labels: ' + String(error),
				);
				throw new Error('Error thrown while syncronising labels: ' + String(error));
			});
			await log(LoggingLevels.notice, 'Successfully applied all labels');
			core.endGroup();
		}

		// Run each release manager
		for (let config of configs.runners) {
			/**
			 * Convert label ID's to Names
			 * @author TGTGamer
			 * @since 1.1.0
			 */
			config.labels = this.configureLabels(configs);

			/**
			 * Get the context
			 * @author TGTGamer
			 * @since 1.1.0
			 */
			const curContext = await this.processContext(config).catch(
				async error => {
					await log(
						LoggingLevels.error,
						'Error thrown while processing context: ' + String(error),
					);
					throw new Error('Error thrown while processing context: ' + String(error));
				},
			);
			await log(
				LoggingLevels.debug,
				`Current Context: ${JSON.stringify(curContext)}`,
			);

			config = this.handleSharedConfig(config, curContext);

			core.endGroup();
			this.applyContext(configs, config, curContext);
		}
	}

	/**
	 * Combine the Shared & Context.type Configs
	 * @author TGTGamer
	 * @since 1.1.0
	 */
	handleSharedConfig(config: Config, curContext: CurContext) {
		for (const a in config.sharedConfig) {
			if (a) {
				const action = a as SharedConfigIndex;
				if (!action || (!config[curContext.type] && !this.fillEmpty)) {
					return config;
				}

				if (!config[curContext.type]) {
					config[curContext.type] = {};
				}

				if (action === 'enforceConventions' || action === 'stale') {
					config[curContext.type]![action] = config.sharedConfig[action];
				} else if (action !== 'labels') {
					return config;
				}

				for (const label in config.sharedConfig.labels) {
					if (label) {
						if (!config[curContext.type]!.labels) {
							config[curContext.type]!.labels = {};
						}

						if (!(label in config[curContext.type]!)) {
							const l = config.sharedConfig.labels[label];
							config[curContext.type]!.labels![label] = l;
						}
					}
				}
			}
		}

		return config;
	}

	configureLabels(configs: Runners) {
		// eslint-disable-next-line unicorn/no-array-reduce
		return Object.entries(configs.labels ? configs.labels : []).reduce(
			(acc: Record<string, string>, cur) => {
				acc[cur[0]] = cur[1].name;
				return acc;
			},
			{},
		);
	}

	/**
	 * Get the configuration
	 * @author IvanFon, TGTGamer, jbinda
	 * @since 1.0.0
	 */
	async processConfig(): Promise<Runners> {
		if (!this.configJson?.runners[0]) {
			if (!this.configPath) {
				throw new Error(
					'Configpath & configJson are undefined',
				);
			}

			const pathConfig = await JSON.parse(
				await this.util.api.files.get(this.configPath, this.configRef),
			) as Runners;
			if (!pathConfig) {
				throw new Error(`config not found at "${this.configPath}"`);
			}

			return pathConfig;
		}

		return this.configJson;
	}

	/**
	 * Handle the context
	 * @author IvanFon, TGTGamer, jbinda
	 * @since 1.0.0
	 */
	async processContext(config: Config) {
		let curContext: CurContext;

		if (context.payload.pull_request) {
			/**
			 * Pull Request Context
			 * @author IvanFon, TGTGamer, jbinda
			 * @since 1.0.0
			 */
			const ctx = await PullRequests.parse(this.util, config, context).catch(
				async error => {
					await log(
						LoggingLevels.error,
						'Error thrown while parsing PR context: ' + String(error),
					);
					throw new Error('Error thrown while parsing PR context: ' + String(error));
				},
			);
			if (!ctx) {
				await log(LoggingLevels.error, 'Pull Request not found on context');
				throw new Error('Pull Request not found on context');
			}

			await log(LoggingLevels.debug, `PR context: ${JSON.stringify(ctx)}`);
			curContext = {
				type: 'pr',
				context: ctx,
			};
		} else if (context.payload.issue) {
			/**
			 * Issue Context
			 * @author IvanFon, TGTGamer, jbinda
			 * @since 1.0.0
			 */
			const ctx = await Issues.parse(this.util, config, context).catch(
				async error => {
					await log(
						LoggingLevels.error,
						'Error thrown while parsing issue context: ' + String(error),
					);
					throw new Error('Error thrown while parsing issue context: ' + String(error));
				},
			);
			if (!ctx) {
				throw new Error('Issue not found on context');
			}

			await log(LoggingLevels.debug, `issue context: ${JSON.stringify(ctx)}`);

			curContext = {
				type: 'issue',
				context: ctx,
			};
		} else if (context.payload.project_card) {
			/**
			 * Project Context
			 * @author TGTGamer
			 * @since 1.0.0
			 */
			const ctx = await Project.parse(this.util, config, context).catch(
				async error => {
					await log(
						LoggingLevels.error,
						'Error thrown while parsing Project context: ' + String(error),
					);
					throw new Error('Error thrown while parsing Project context: ' + String(error));
				},
			);
			if (!ctx) {
				throw new Error('Project Card not found on context');
			}

			await log(LoggingLevels.debug, `Project Card context: ${JSON.stringify(ctx)}`);

			curContext = {
				type: 'project',
				context: ctx,
			};
		} else if (context.payload.schedule) {
			/**
			 * Project Schedule Context
			 * @author TGTGamer
			 * @since 1.0.0
			 */
			const ctx = await Schedule.parse(context).catch(async error => {
				await log(
					LoggingLevels.error,
					'Error thrown while parsing Schedule context: ' + String(error),
				);
				throw new Error('Error thrown while parsing Schedule context: ' + String(error));
			});
			if (!ctx) {
				throw new Error('Schedule not found on context');
			}

			await log(LoggingLevels.debug, `Schedule context: ${JSON.stringify(ctx)}`);

			curContext = {
				type: 'schedule',
				context: ctx,
			};
		} else {
			/**
			 * No Context
			 * @author TGTGamer
			 * @since 1.1.0
			 */
			await log(
				LoggingLevels.notice,
				`There is no context to parse: ${JSON.stringify(context.payload)}`,
			);
			throw new Error(`There is no context to parse: ${JSON.stringify(context.payload)}`);
		}

		return curContext;
	}

	/**
	 * Syncronise labels to repository
	 * @author IvanFon, TGTGamer, jbinda
	 * @since 1.0.0
	 */
	async syncLabels(config: Runners) {
		// eslint-disable-next-line unicorn/no-array-reduce
		const labels = Object.entries(config.labels ? config.labels : []).reduce(
			(acc: Record<string, Label>, cur) => {
				if (cur[0] === '$schema') {
					return acc;
				}

				acc[cur[1].name.toLowerCase()] = cur[1];
				return acc;
			},
			{},
		);

		await this.util.labels.sync(labels).catch(async error => {
			await log(
				LoggingLevels.error,
				'Error thrown while handling syncLabels tasks:',
				error,
			);
		});
	}

	applyContext(runners: Runners, config: Config, curContext: CurContext) {
		let ctx: PullRequests | Issues | Project | Schedule | undefined;

		switch (curContext.type) {
			case 'pr':
				ctx = new PullRequests(this.util, runners, config, curContext, this.dryRun);
				break;
			case 'issue':
				ctx = new Issues(this.util, runners, config, curContext, this.dryRun);
				break;
			case 'project':
				ctx = new Project(this.util, runners, config, curContext, this.dryRun);
				break;
			case 'schedule':
				ctx = new Schedule(this.util, runners, config, curContext, this.dryRun);
				break;
			default:
				ctx = undefined;
		}

		if (!ctx) {
			throw new LoggingDataClass(LoggingLevels.error, 'Context not found');
		}

		ctx.run().catch(async error => {
			await log(
				LoggingLevels.error,
				'Error thrown while running context: ' + String(error),
			);
		});
	}
}
