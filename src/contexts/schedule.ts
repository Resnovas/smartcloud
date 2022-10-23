/*
 * Project: @resnovas/smartcloud
 * File: schedule.ts
 * Path: \src\contexts\schedule.ts
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
import type {Context} from '@actions/github/lib/context';
import {log, LoggingLevels} from '../logging';
import type {Config, Runners, SharedConfig} from '../types';
import type {CurContext, IssueContext, ScheduleContext} from '../conditions';
import type {Utils} from '../utils';
import {Contexts} from './methods';

/**
 * The schedule configuration
 */
export type ScheduleConfig = SharedConfig;

export class Schedule extends Contexts {
	/**
	 * Parse the Schedule Context
	 * @author TGTGamer
	 * @since 1.0.0
	 */

	static async parse(context: Context): Promise<ScheduleContext | undefined> {
		return {
			...context,
			repo: context.repo,
			issue: context.issue,
			props: {
				type: 'schedule',
			},
		};
	}

	context: ScheduleContext;
	ctx: ScheduleContext;
	config: ScheduleConfig;

	// eslint-disable-next-line max-params
	constructor(
		util: Utils,
		runners: Runners,
		configs: Config,
		curContext: CurContext,
		dryRun: boolean,
	) {
		if (curContext.type !== 'schedule') {
			throw new Error(log(
				LoggingLevels.error,
				'Cannot construct without schedule context',
			));
		}

		super(util, runners, configs, curContext, dryRun);
		this.context = curContext.context;
		this.ctx = curContext.context;
		if (!configs.schedule) {
			throw new Error(log(
				LoggingLevels.error,
				'Cannot start without config',
			));
		}

		this.config = configs.schedule;
	}

	async run(attempt?: number) {
		if (!this.config) {
			throw new Error(log(
				LoggingLevels.warn,
				'Cannot start without config',
			));
		}

		if (!attempt) {
			attempt = 1;
			core.startGroup('Schedule Actions');
		}

		const seconds = attempt * 10;
		try {
			const issues = await this.util.api.issues.list({});

			// Todo: fix this for each loop
			// eslint-disable-next-line unicorn/no-array-for-each
			issues.forEach(async issue => {
				const labels = await this.util.parsingData
					.labels(issue.labels)
					.catch(async error => {
						throw new Error(log(
							LoggingLevels.error,
							'Error thrown while parsing labels: ' + String(error),
						));
					});

				const context: IssueContext = {
					...this.ctx,

					// Todo: ask for advice on how to resolve
					// @ts-expect-error due to the range of possible types, it throws an error even though its fully populated
					props: {
						type: 'issue',
						...issue,
						labels,
					},
				};

				log(
					LoggingLevels.debug,
					`Testing issue: ${issue.id} - ${issue.title} - ${issue.html_url} - Last updated: ${issue.updated_at}`,
				);
				if (this.config.stale) {
					await this.checkStale(this, context, this.config).catch(async error => {
						throw new Error(log(LoggingLevels.error, 'Error checking stale:' + String(error)));
					});
				}

				log(
					LoggingLevels.debug,
					`Should apply labels? \r\n\r\n\r\n\r\n ${JSON.stringify(
						this.config.labels,
					)}`,
				);
				if (this.config.labels) {
					await this.applyLabels(this).catch(async error => {
						throw new Error(log(LoggingLevels.error, 'Error applying label:' + String(error)));
					});
				}
			});
			core.endGroup();
		} catch (error: unknown) {
			if (attempt > this.retryLimit) {
				core.endGroup();
				throw new Error(log(
					LoggingLevels.emergency,
					'Scheduled actions failed. Terminating job.',
				));
			}

			log(
				LoggingLevels.warn,
				`Scheduled Actions failed with "${String(error)}", retrying in ${seconds} seconds....`,
			);
			attempt++;
			setTimeout(async () => {
				await this.run(attempt);
			}, seconds * 1000);
		}
	}
}
