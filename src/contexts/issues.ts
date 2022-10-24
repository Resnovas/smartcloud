/*
 * Project: @resnovas/smartcloud
 * File: issues.ts
 * Path: \src\contexts\issues.ts
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
 * Last Modified: 23-10-2022
 * By: Jonathan Stevens (Email: jonathan@resnovas.com, Github: https://github.com/TGTGamer)
 * Current Version: 1.0.0-beta.0
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */

import * as core from '@actions/core';
import type {Context} from '@actions/github/lib/context.js';
import type {IssuesEvent, IssueCommentEvent} from '@octokit/webhooks-types';
import {log, LoggingLevels} from '../logging.js';
import type {Config, Runners, SharedConfig} from '../types.js';
import type {CurContext, IssueContext, Version} from '../conditions/index.js';
import type {Utils} from '../utils/index.js';
import {Contexts} from './methods/index.js';
import type {AssignProject} from './methods/assign-project.js';
import type {CreateBranch} from './methods/create-branch.js';

/**
 * The issue configuration
 */
export type IssueConfig = {
	/**
	 * Assign project configuration.
	 */
	assignProject?: AssignProject[];
	/**
	 * Open branch configuration
	 */
	createBranch?: Record<string, CreateBranch>;
} & SharedConfig;

export class Issues extends Contexts {
	/**
	 * Parse the Issue Context
	 * @author IvanFon, TGTGamer, jbinda
	 * @since 1.0.0
	 */
	static async parse(
		utils: Utils,
		config: Config,
		context: Context,
	): Promise<IssueContext | undefined> {
		const payload = context.payload as IssuesEvent | IssueCommentEvent;
		const issue = payload.issue;
		if (!issue) {
			return;
		}

		log(
			LoggingLevels.debug,
			'context.payload.issue: ' + JSON.stringify(context.payload.issue),
		);

		const labels = await utils.parsingData
			.labels(issue.labels)
			.catch(async error => {
				throw new Error(log(LoggingLevels.error, 'Error thrown while parsing labels: ' + String(error)));
			});

		let currentVersion: Version | undefined;
		if (config.versioning) {
			currentVersion = await utils.versioning
				.parse(config, config.issue?.ref)
				.catch(async error => {
					throw new Error(log(
						LoggingLevels.error,
						'Error thrown while parsing versioning: ' + String(error),
					));
				});
		}

		return {
			...context,
			currentVersion,

			// Todo: ask for advice on how to resolve
			// @ts-expect-error due to the range of possible types, it throws an error even though its fully populated
			props: {
				type: 'issue',
				...issue,
				labels,
			},
		};
	}

	context: IssueContext;
	config: IssueConfig;

	// eslint-disable-next-line max-params
	constructor(
		util: Utils,
		runners: Runners,
		configs: Config,
		curContext: CurContext,
		dryRun: boolean,
	) {
		if (curContext.type !== 'issue') {
			throw new Error(log(
				LoggingLevels.error,
				'Cannot construct without issue context',
			));
		}

		super(util, runners, configs, curContext, dryRun);
		this.context = curContext.context;
		if (!configs.issue) {
			throw new Error(log(
				LoggingLevels.error,
				'Cannot start without config',
			));
		}

		this.config = configs.issue;
	}

	async run(attempt?: number) {
		if (!this.config) {
			log(
				LoggingLevels.warn,
				'Cannot start without config',
			);
		}

		if (!attempt) {
			attempt = 1;
			core.startGroup('Issue Actions');
		}

		const seconds = attempt * 10;
		try {
			if (this.config.enforceConventions) {
				await this.conventions.enforce(this);
			}

			if (this.config.labels) {
				await this.applyLabels(this).catch(async error => {
					throw new Error(log(LoggingLevels.error, 'Error applying label' + String(error)));
				});
			}

			if (this.config.assignProject) {
				await this.assignProject(this).catch(async error => {
					throw new Error(log(LoggingLevels.error, 'Error assigning projects' + String(error)));
				});
			}

			core.endGroup();
		} catch (error: unknown) {
			if (attempt > this.retryLimit) {
				core.endGroup();
				throw new Error(log(
					LoggingLevels.emergency,
					'Issue actions failed. Terminating job.',
				));
			}

			log(
				LoggingLevels.warn,
				`Issue Actions failed with "${String(error)}", retrying in ${seconds} seconds....`,
			);
			attempt++;
			setTimeout(async () => {
				await this.run(attempt);
			}, seconds * 1000);
		}
	}
}
