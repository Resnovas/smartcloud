/*
 * Project: @resnovas/smartcloud
 * File: pull-requests.ts
 * Path: \src\contexts\pull-requests.ts
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
import type {PullRequestEvent} from '@octokit/webhooks-types';
import {log, LoggingLevels} from '../logging.js';
import type {Config, Runners, SharedConfig} from '../types.js';
import type {CurContext, PrContext, Reviews, Version} from '../conditions/index.js';
import type {Utils} from '../utils/index.js';
import {Contexts} from './methods/index.js';
import type {AssignProject} from './methods/assign-project.js';
import type {AutomaticApprove} from './methods/auto-approve.js';
import type {Release} from './methods/release.js';
import type {RequestApprovals} from './methods/request-approvals.js';
import type {SyncRemote} from './methods/sync-remote-repo.js';

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
		const payload = context.payload as PullRequestEvent;
		const pr = payload.pull_request;
		if (!pr) {
			return;
		}

		log(
			LoggingLevels.debug,
			'context.payload.pull_request: '
			+ JSON.stringify(context.payload.pull_request),
		);

		const idNumber = pr.number;

		const labels = await utils.parsingData.labels(pr.labels).catch(async error => {
			throw new Error(log(LoggingLevels.error, 'Error thrown while parsing labels: ' + String(error)));
		});

		const files: string[] = await utils.api.files
			.list(idNumber)
			.catch(async error => {
				throw new Error(log(LoggingLevels.error, 'Error thrown while listing files: ' + String(error)));
			});

		const changes: number = await utils.api.pullRequests
			.changes(pr.additions, pr.deletions)
			.catch(async error => {
				throw new Error(log(
					LoggingLevels.error,
					'Error thrown while handling changes: ' + String(error),
				));
			});

		const reviews: Reviews = await utils.api.pullRequests.reviews
			.list(idNumber)
			.catch(async error => {
				throw new Error(log(
					LoggingLevels.error,
					'Error thrown while handling reviews: ' + String(error),
				));
			});

		const pendingReview: boolean = await utils.api.pullRequests.reviews
			.pending(reviews.length, pr.requested_reviewers.length)
			.catch(async error => {
				throw new Error(log(
					LoggingLevels.error,
					'Error thrown while handling reviews: ' + String(error),
				));
			});

		const requestedChanges: number = await utils.api.pullRequests.reviews
			.requestedChanges(reviews)
			.catch(async error => {
				throw new Error(log(
					LoggingLevels.error,
					'Error thrown while handling reviews: ' + String(error),
				));
			});

		const approved: number = await utils.api.pullRequests.reviews
			.isApproved(reviews)
			.catch(async error => {
				throw new Error(log(
					LoggingLevels.error,
					'Error thrown while handling reviews: ' + String(error),
				));
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
				...pr,
				type: 'pr',
				files,
				changes,
				reviews,
				pendingReview,
				requestedChanges,
				approved,
				labels,
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
			throw new Error(log(
				LoggingLevels.error,
				'Cannot construct without pr context',
			));
		}

		super(util, runners, configs, curContext, dryRun);
		this.context = curContext.context;
		if (!configs.pr) {
			throw new Error(log(
				LoggingLevels.error,
				'Cannot start without config',
			));
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
					throw new Error(log(LoggingLevels.error, 'Error applying labels ' + String(error)));
				});
			}

			if (this.config.assignProject) {
				await this.assignProject(this).catch(async error => {
					throw new Error(log(LoggingLevels.error, 'Error assigning projects ' + String(error)));
				});
			}

			if (this.config.automaticApprove) {
				await this.automaticApprove(this).catch(async error => {
					throw new Error(log(LoggingLevels.error, 'Error approving ' + String(error)));
				});
			}

			if (this.config.requestApprovals) {
				await this.requestApprovals(this).catch(async error => {
					throw new Error(log(LoggingLevels.error, 'Error requesting approval ' + String(error)));
				});
			}

			// If (this.config.manageRelease) {
			// 	await this.bumpVersion(this).catch(async error => {
			// 		throw new Error(log(LoggingLevels.error, 'Error managing release ' + String(error)));
			// 	});
			// }

			// Create changelog
			// create release
			// sync remote repositories
			// if (this.config.syncRemote) await this.syncRemoteRepo(this)
			core.endGroup();
		} catch (error: unknown) {
			if (attempt > this.retryLimit) {
				core.endGroup();
				throw new Error(log(
					LoggingLevels.emergency,
					'Pull Request actions failed. Terminating job.',
				));
			}

			log(
				LoggingLevels.warn,
				`Pull Request Actions failed with "${String(error)}", retrying in ${seconds} seconds....`,
			);
			attempt++;
			setTimeout(async () => {
				this.newVersion = await this.util.versioning.parse(
					this.runnerConfigs,
					this.config?.ref ?? this.context.ref,
				);
				await this.run(attempt);
			}, seconds * 1000);
		}
	}
}
