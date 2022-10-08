/**
 * Project: @resnovas/smartcloud
 * File: pullRequests.ts
 * Path: \src\contexts\pullRequests.ts
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

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import * as core from '@actions/core';
import {LoggingDataClass, LoggingLevels} from '@resnovas/utilities';
import type {Context} from '@actions/github/lib/context';
import {log} from '../logging';
import type {Config, Runners, SharedConfig} from '../types';
import type {CurContext, PrContext, Reviews, Version} from '../conditions';
import type {Utils} from '../utils';
import {Contexts} from './methods';
import type {AssignProject} from './methods/assign-project';
import type {AutomaticApprove} from './methods/auto-approve';
import type {Release} from './methods/release';
import type {RequestApprovals} from './methods/requestApprovals';
import type {SyncRemote} from './methods/sync-remote-repo';

/**
 * The Pull Request configuration
 */
export type PullRequestConfig = {
	/**
	 *  The project assignment configuration.
	 */
	assignProject?: AssignProject[];
	/**
	 * The automatic approval configuration
	 */
	automaticApprove?: AutomaticApprove;
	/**
	 * The release management configuration.
	 */
	manageRelease?: Release;
	/**
	 * Syncronise remote repository configuration.
	 */
	syncRemote?: SyncRemote[];
	/**
	 * Request approvals configuration.
	 */
	requestApprovals?: RequestApprovals;
} & SharedConfig;

/**
 * The pull request class.
 */
export class PullRequests extends Contexts {
	/**
	 * Parse the PR Context
	 * @author IvanFon, TGTGamer, jbinda
	 * @since 1.0.0
	 */
	static async parse(
		utils: Utils,
		config: Config,
		context: Context,
	): Promise<PrContext | undefined> {
		const pr = context.payload.pull_request;
		if (!pr) {
			return;
		}

		await log(
			LoggingLevels.debug,
			'context.payload.pull_request: '
			+ JSON.stringify(context.payload.pull_request),
		);

		const idNumber = pr.number;
		const labels = await utils.parsingData.labels(pr.labels).catch(async error => {
			await log(LoggingLevels.error, 'Error thrown while parsing labels: ' + String(error));
			throw new Error(error);
		});
		const files: string[] = await utils.api.files
			.list(idNumber)
			.catch(async error => {
				await log(LoggingLevels.error, 'Error thrown while listing files: ' + String(error));
				throw new Error(error);
			});

		const changes: number = await utils.api.pullRequests
			.changes(pr.additions, pr.deletions)
			.catch(async error => {
				await log(
					LoggingLevels.error,
					'Error thrown while handling changes: ' + String(error),
				);
				throw new Error(error);
			});

		const reviews: Reviews = await utils.api.pullRequests.reviews
			.list(idNumber)
			.catch(async error => {
				await log(
					LoggingLevels.error,
					'Error thrown while handling reviews: ' + String(error),
				);
				throw new Error(error);
			});

		const pendingReview: boolean = await utils.api.pullRequests.reviews
			.pending(reviews.length, pr.requested_reviewers.length)
			.catch(async error => {
				await log(
					LoggingLevels.error,
					'Error thrown while handling reviews: ' + String(error),
				);
				throw new Error(error);
			});

		const requestedChanges: number = await utils.api.pullRequests.reviews
			.requestedChanges(reviews)
			.catch(async error => {
				await log(
					LoggingLevels.error,
					'Error thrown while handling reviews: ' + String(error),
				);
				throw new Error(error);
			});

		const approved: number = await utils.api.pullRequests.reviews
			.isApproved(reviews)
			.catch(async error => {
				await log(
					LoggingLevels.error,
					'Error thrown while handling reviews: ' + String(error),
				);
				throw new Error(error);
			});

		let currentVersion: Version | undefined;
		if (config.versioning) {
			currentVersion = await utils.versioning
				.parse(config, config.issue?.ref)
				.catch(async error => {
					await log(
						LoggingLevels.error,
						'Error thrown while parsing versioning: ' + String(error),
					);
					throw new Error(error);
				});
		}

		return {
			ref: context.ref,
			sha: context.sha,
			action: context.payload.action!,
			currentVersion,
			idNumber: context.payload.pull_request?.id,
			props: {
				type: 'pr',
				id: idNumber,
				branch: pr.head.ref,
				creator: pr.user.login,
				description: pr.body ?? '',
				isDraft: pr.draft,
				locked: pr.locked,
				state: pr.state,
				title: pr.title,
				files,
				changes,
				reviews,
				labels,
				pendingReview,
				requestedChanges,
				approved,
			},
		};
	}

	context: PrContext;
	config: PullRequestConfig;
	// eslint-disable-next-line max-params
	constructor(
		util: Utils,
		runners: Runners,
		configs: Config,
		curContext: CurContext,
		dryRun: boolean,
	) {
		if (curContext.type !== 'pr') {
			throw new LoggingDataClass(
				LoggingLevels.error,
				'Cannot construct without pr context',
			);
		}

		super(util, runners, configs, curContext, dryRun);
		this.context = curContext.context;
		if (!configs.pr) {
			throw new LoggingDataClass(
				LoggingLevels.error,
				'Cannot start without config',
			);
		}

		this.config = configs.pr;
	}

	async run(attempt?: number) {
		if (!this.config) {
			throw new Error('Cannot start without config');
		}

		if (!attempt) {
			attempt = 1;
			core.startGroup('Pull Request Actions');
		}

		const seconds = attempt * 10;

		try {
			if (this.config.enforceConventions) {
				await this.conventions.enforce(this);
			}

			if (this.config.labels) {
				await this.applyLabels(this).catch(async error => {
					await log(LoggingLevels.error, 'Error applying labels ' + String(error));
					throw new Error(error);
				});
			}

			if (this.config.assignProject) {
				await this.assignProject(this).catch(async error => {
					await log(LoggingLevels.error, 'Error assigning projects ' + String(error));
					throw new Error(error);
				});
			}

			if (this.config.automaticApprove) {
				await this.automaticApprove(this).catch(async error => {
					await log(LoggingLevels.error, 'Error approving ' + String(error));
					throw new Error(error);
				});
			}

			if (this.config.requestApprovals) {
				await this.requestApprovals(this).catch(async error => {
					await log(LoggingLevels.error, 'Error requesting approval ' + String(error));
					throw new Error(error);
				});
			}

			if (this.config.manageRelease) {
				await this.bumpVersion(this).catch(async error => {
					await log(LoggingLevels.error, 'Error managing release ' + String(error));
					throw new Error(error);
				});
			}

			// Create changelog
			// create release
			// sync remote repositories
			// if (this.config.syncRemote) await this.syncRemoteRepo(this)
			core.endGroup();
		} catch (error: unknown) {
			if (attempt > this.retryLimit) {
				core.endGroup();
				await log(
					LoggingLevels.emergency,
					'Pull Request actions failed. Terminating job.',
				);
				throw new Error('Pull Request actions failed. Terminating job.');
			}

			await log(
				LoggingLevels.warn,
				`Pull Request Actions failed with "${String(error)}", retrying in ${seconds} seconds....`,
			);
			attempt++;
			setTimeout(async () => {
				this.newVersion = await this.util.versioning.parse(
					this.configs,
					this.config?.ref ?? this.context.ref,
				);
				await this.run(attempt);
			}, seconds * 1000);
		}
	}
}
