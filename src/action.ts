/*
 * Project: @resnovas/smartcloud
 * File: action.ts
 * Path: \src\action.ts
 * Created Date: Saturday, October 8th 2022
 * Author: Jonathan Stevens (Email: jonathan@resnovas.com, Github: https://github.com/TGTGamer)
 * -----
 * Contributing: Please read through our contributing guidelines. Included are directions for opening
 * issues, coding standards, and notes on development. These can be found at https://github.com/resnovas/smartcloud/CONTRIBUTING.md
 *
 * Code of Conduct: This project abides by the Contributor Covenant, version 2.0. Please interact in ways that contribute to an open,
 * welcoming, diverse, inclusive, and healthy community. Our Code of Conduct can be found at https://github.com/resnovas/smartcloud/CODE_OF_CONDUCT.md
 * -----
 * Copyright (c) 2022 Resnovas - All Rights Reserved
 * LICENSE: GNU General Public License v3.0 or later (GPL-3.0+)
 * -----
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
 * along with this program. If not, please write to: jonathan@resnovas.com,
 * or see https://www.gnu.org/licenses/gpl-3.0-standalone.html
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE - PLEASE SEE THE LICENSE FILE FOR DETAILS
 * -----
 * Last Modified: 24-10-2022
 * By: Jonathan Stevens (Email: jonathan@resnovas.com, Github: https://github.com/TGTGamer)
 * Current Version: 1.0.0-beta.0
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */

/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import fs from 'node:fs';
import process, {cwd} from 'node:process';
import * as core from '@actions/core';
import {context as GHContext} from '@actions/github';
import type {Context} from '@actions/github/lib/context.js';
import type {
	CurContext,
} from './conditions/index.js';
import {Issues, Project, PullRequests, Schedule} from './contexts/index.js';
import {Utils} from './utils/index.js';
import {log, LoggingLevels} from './logging.js';
import type {Options, Github, Config, SharedConfigIndex, Runners, Label} from './types.js';

const localEx: boolean = fs.existsSync(cwd() + '/config.json');
let local: any;
let context = GHContext;

export default class Action {
	client: Github;
	opts: Options;
	configJson: Options['configJson'];
	configPath: Options['configPath'];
	configRef: Options['configRef'];
	dryRun: Options['dryRun'];
	fillEmpty: Options['fillEmpty'];
	repo!: Context['repo'];
	util!: Utils;
	ref?: string;

	constructor(client: Github, options: Options) {
		core.startGroup('Setup Phase');
		this.client = client;
		this.opts = options;
		this.dryRun = options.dryRun;
		this.configJson = options.configJson;
		this.configPath = options.configPath;
		this.configRef = options.configRef;
		this.fillEmpty = options.fillEmpty;
		this.ref = options.ref ?? context.ref;
	}

	async run() {
		log(LoggingLevels.debug, 'Running action');

		if (localEx) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
			// @ts-ignore
			local = await import('../config.json');
			process.env.GITHUB_REPOSITORY = local.GITHUB_REPOSITORY;
			process.env.GITHUB_REPOSITORY_OWNER = local.GITHUB_REPOSITORY_OWNER;
			if (!context.payload.issue && !context.payload.pull_request) {
				context = await import(local.github_context) as Context;
			}
		}

		this.repo = context.repo;

		if (this.dryRun) {
			if (this.opts.repo) {
				this.repo = this.opts.repo;
			}

			if (!this.opts.repo?.repo) {
				this.repo.repo = process.env.GITHUB_REPOSITORY ?? 'Unknown';
			}

			if (!this.opts.repo?.owner) {
				this.repo.owner = process.env.GITHUB_REPOSITORY_OWNER ?? 'Unknown';
			}
		}

		this.util = new Utils(
			{client: this.client, repo: this.repo},
			{dryRun: this.opts.dryRun, skipDelete: this.opts.skipDelete, ref: this.ref},
			{
				git: this.opts.git,
			},
		);

		log(LoggingLevels.debug, `Repo data: ${this.repo.owner}/${this.repo.repo}`);

		/**
		 * Capture and log context to debug for Local Running
		 * @author TGTGamer
		 * @since 1.0.0
		 */
		log(
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
		const configs = await this.processConfig().catch(async (error: Error) => {
			log(
				LoggingLevels.error,
				'Error thrown while processing config: ' + String(error),
			);
			throw error;
		});
		if (!configs.runners[0]) {
			throw new Error(log(LoggingLevels.error, 'No config data.'));
		}

		log(LoggingLevels.debug, `Config: ${JSON.stringify(configs)}`);

		if (configs.labels) {
			/**
			 * Syncronise the labels
			 * @author TGTGamer
			 * @since 1.1.0
			 */
			core.startGroup('label Actions');
			log(LoggingLevels.debug, 'Attempting to apply labels');
			await this.syncLabels(configs).catch(async (error: Error) => {
				log(
					LoggingLevels.error,
					'Error thrown while syncronising labels: ' + String(error),
				);
				throw error;
			});
			log(LoggingLevels.notice, 'Successfully applied all labels');
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
				async (error: Error) => {
					log(
						LoggingLevels.error,
						'Error thrown while processing context: ' + String(error),
					);
					throw error;
				},
			);
			log(
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

				if (action === 'stale') {
					config[curContext.type]![action] = config.sharedConfig[action];
				} else if (action === 'enforceConventions') {
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
							if (l) {
								config[curContext.type]!.labels![label] = l;
							}
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
				async (error: Error) => {
					log(
						LoggingLevels.error,
						'Error thrown while parsing PR context: ' + String(error),
					);
					throw error;
				},
			);
			if (!ctx) {
				throw new Error(log(LoggingLevels.error, 'Pull Request not found on context'));
			}

			log(LoggingLevels.debug, `PR context: ${JSON.stringify(ctx)}`);
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
				async (error: Error) => {
					log(
						LoggingLevels.error,
						'Error thrown while parsing issue context: ' + String(error),
					);
					throw error;
				},
			);
			if (!ctx) {
				throw new Error('Issue not found on context');
			}

			log(LoggingLevels.debug, `issue context: ${JSON.stringify(ctx)}`);

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
				async (error: Error) => {
					log(
						LoggingLevels.error,
						'Error thrown while parsing Project context: ' + String(error),
					);
					throw error;
				},
			);
			if (!ctx) {
				throw new Error('Project Card not found on context');
			}

			log(LoggingLevels.debug, `Project Card context: ${JSON.stringify(ctx)}`);

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
			const ctx = await Schedule.parse(context).catch(async (error: Error) => {
				log(
					LoggingLevels.error,
					'Error thrown while parsing Schedule context: ' + String(error),
				);
				throw error;
			});
			if (!ctx) {
				throw new Error('Schedule not found on context');
			}

			log(LoggingLevels.debug, `Schedule context: ${JSON.stringify(ctx)}`);

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
			log(
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

		await this.util.labels.sync(labels).catch(async (error: Error) => {
			log(
				LoggingLevels.error,
				'Error thrown while handling syncLabels tasks:'
				+ String(error),
			);
			throw error;
		});
	}

	applyContext(runners: Runners, config: Config, curContext: CurContext) {
		let ctx: PullRequests | Issues | Project | Schedule | undefined;

		switch (curContext.type) {
			case 'pr': {
				ctx = new PullRequests(this.util, runners, config, curContext, this.dryRun);
				break;
			}

			case 'issue': {
				ctx = new Issues(this.util, runners, config, curContext, this.dryRun);
				break;
			}

			case 'project': {
				ctx = new Project(this.util, runners, config, curContext, this.dryRun);
				break;
			}

			case 'schedule': {
				ctx = new Schedule(this.util, runners, config, curContext, this.dryRun);
				break;
			}

			default: {
				ctx = undefined;
			}
		}

		if (!ctx) {
			throw new Error(log(LoggingLevels.error, 'Context not found'));
		}

		ctx.run().catch(async (error: Error) => {
			log(
				LoggingLevels.error,
				'Error thrown while running context: ' + String(error),
			);
			throw error;
		});
	}
}
