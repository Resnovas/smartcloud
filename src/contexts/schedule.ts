/**
 * Project: @resnovas/smartcloud
 * File: schedule.ts
 * Path: \src\contexts\schedule.ts
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
import type {Config, Runners, SharedConfig} from '../action';
import type {CurContext, ScheduleContext} from '../conditions';
import type {Utils} from '../utils';
import {Contexts} from './methods';

/**
 * The schedule configuration
 */
export type ScheduleConfig = SharedConfig;

export class Schedule extends Contexts {
	context: ScheduleContext;
	ctx: ScheduleContext;
	config: ScheduleConfig;

	constructor(
		util: Utils,
		runners: Runners,
		configs: Config,
		curContext: CurContext,
		dryRun: boolean,
	) {
		if (curContext.type !== 'schedule') {
			throw new LoggingDataClass(
				LoggingLevels.error,
				'Cannot construct without schedule context',
			);
		}

		super(util, runners, configs, curContext, dryRun);
		this.context = curContext.context;
		this.ctx = curContext.context;
		if (!configs.schedule) {
			throw new LoggingDataClass(
				LoggingLevels.error,
				'Cannot start without config',
			);
		}

		this.config = configs.schedule;
	}

	/**
	 * Parse the Schedule Context
	 * @author TGTGamer
	 * @since 1.0.0
	 */

	static async parse(context: Context): Promise<ScheduleContext | undefined> {
		return {
			ref: context.ref,
			sha: context.sha,
			action: context.payload.action!,
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
			core.startGroup('Schedule Actions');
		}

		const seconds = attempt * 10;
		try {
			const issues = await this.util.api.issues.list({});
			issues.forEach(async issue => {
				const labels = await this.util.parsingData
					.labels(issue.labels)
					.catch(error => {
						log(
							LoggingLevels.error,
							'Error thrown while parsing labels: ' + error,
						);
						throw error;
					});

				this.context = {
					...this.ctx,
					props: {
						type: 'issue',
						ID: issue.number,
						creator: issue.user?.login ? issue.user.login : '',
						description: issue.body || '',
						locked: issue.locked,
						labels,
						title: issue.title,
						state: issue.state === 'open' ? 'open' : 'closed',
						lastUpdated: issue.updated_at,
					},
				};

				log(
					LoggingLevels.debug,
					`Testing issue: ${issue.id} - ${issue.title} - ${issue.html_url} - Last updated: ${issue.updated_at}`,
				);
				if (this.config.stale) {
					await this.checkStale(this).catch(error => {
						log(LoggingLevels.error, 'Error checking stale:' + error);
					});
				}

				log(
					LoggingLevels.debug,
					`Should apply labels? \r\n\r\n\r\n\r\n ${JSON.stringify(
						this.config.labels,
					)}`,
				);
				if (this.config.labels) {
					await this.applyLabels(this).catch(error => {
						log(LoggingLevels.error, 'Error applying label:' + error);
					});
				}
			});
			core.endGroup();
		} catch (error) {
			if (attempt > this.retryLimit) {
				core.endGroup();
				throw new LoggingDataClass(
					LoggingLevels.emergency,
					'Scheduled actions failed. Terminating job.',
					{errors: error as Error},
				);
			}

			log(
				LoggingLevels.warn,
				`Scheduled Actions failed with "${error}", retrying in ${seconds} seconds....`,
			);
			attempt++;
			setTimeout(async () => {
				this.run(attempt);
			}, seconds * 1000);
		}
	}
}
