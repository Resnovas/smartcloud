/**
 * Project: @resnovas/smartcloud
 * File: issues.ts
 * Path: \src\contexts\issues.ts
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

import * as core from '@actions/core';
import type {Context} from '@actions/github/lib/context';
import {LoggingDataClass, LoggingLevels} from '@resnovas/utilities';
import {log} from '../logging';
import type {Config, Runners, SharedConfig} from '../types';
import type {CurContext, IssueContext, Version} from '../conditions';
import type {Utils} from '../utils';
import {Contexts} from './methods';
import type {AssignProject} from './methods/assign-project';
import type {CreateBranch} from './methods/create-branch';

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
	context: IssueContext;
	config: IssueConfig;
	constructor(
		util: Utils,
		runners: Runners,
		configs: Config,
		curContext: CurContext,
		dryRun: boolean,
	) {
		if (curContext.type !== 'issue') {
			throw new LoggingDataClass(
				LoggingLevels.error,
				'Cannot construct without issue context',
			);
		}

		super(util, runners, configs, curContext, dryRun);
		this.context = curContext.context;
		if (!configs.issue) {
			throw new LoggingDataClass(
				LoggingLevels.error,
				'Cannot start without config',
			);
		}

		this.config = configs.issue;
	}

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
		const issue = context.payload.issue;
		if (!issue) {
			return;
		}

		log(
			LoggingLevels.debug,
			'context.payload.issue: ' + JSON.stringify(context.payload.issue),
		);

		const labels = await utils.parsingData
			.labels(issue.labels)
			.catch(error => {
				log(LoggingLevels.error, 'Error thrown while parsing labels: ' + error);
				throw error;
			});

		let currentVersion: Version | undefined;
		if (config.versioning) {
			currentVersion = await utils.versioning
				.parse(config, config.issue?.ref)
				.catch(error => {
					log(
						LoggingLevels.error,
						'Error thrown while parsing versioning: ' + error,
					);
					throw error;
				});
		}

		return {
			sha: context.sha,
			action: context.payload.action!,
			currentVersion,
			IDNumber: context.payload.issue?.id,
			props: {
				type: 'issue',
				ID: issue.number,
				creator: issue.user.login,
				description: issue.body || '',
				locked: issue.locked,
				state: issue.state,
				labels,
				title: issue.title,
			},
		};
	}

	async run(attempt?: number) {
		if (!this.config) {
			throw new LoggingDataClass(
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
				await this.applyLabels(this).catch(error => {
					log(LoggingLevels.error, 'Error applying label' + error);
				});
			}

			if (this.config.assignProject) {
				await this.assignProject(this).catch(error => {
					log(LoggingLevels.error, 'Error assigning projects' + error);
				});
			}

			core.endGroup();
		} catch (error) {
			if (attempt > this.retryLimit) {
				core.endGroup();
				throw new LoggingDataClass(
					LoggingLevels.emergency,
					'Issue actions failed. Terminating job.',
				);
			}

			log(
				LoggingLevels.warn,
				`Issue Actions failed with "${error}", retrying in ${seconds} seconds....`,
			);
			attempt++;
			setTimeout(async () => {
				this.run(attempt);
			}, seconds * 1000);
		}
	}
}
