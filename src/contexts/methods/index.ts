/*
 * Project: @resnovas/smartcloud
 * File: index.ts
 * Path: \src\contexts\methods\index.ts
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
import process from 'node:process';
import type {Config, Runners, SharedConfig} from '../../types.js';
import type {
	CurContext,
	IssueContext,
	PrContext,
	ProjectContext,
	ScheduleContext,
	ScheduleIssueContext,
	UtilThis,
	Version,
} from '../../conditions/index.js';
import type {Schedule} from '../schedule.js';
import type {Utils, Event} from '../../utils/index.js';
import type {IssueConfig, Issues} from '../issues.js';
import type {ProjectConfig, Project} from '../projects.js';
import type {PullRequestConfig, PullRequests} from '../pull-requests.js';
import {log, LoggingLevels} from '../../logging.js';
import {applyLabels} from './apply-labels.js';
import {assignProject} from './assign-project.js';
import {automaticApprove} from './auto-approve.js';
import {bumpVersion} from './bump-version.js';
import {checkStale} from './check-stale.js';
import * as conventions from './conventions.js';
import {requestApprovals} from './request-approvals.js';
import {syncRemoteProject} from './sync-remote-project.js';

export * from './apply-labels.js';
export * from './assign-project.js';
export * from './auto-approve.js';
export * from './changelog.js';
export * from './check-stale.js';
export * from './conventions.js';
export * from './create-branch.js';
export * from './handle-milestone.js';
export * from './release.js';
export * from './sync-remote-project.js';
export * from './sync-remote-repo.js';

export class Contexts {
	runners: Runners;
	runnerConfigs: Config;
	config: PullRequestConfig | IssueConfig | ProjectConfig;
	curContext: CurContext;
	context: ProjectContext | IssueContext | PrContext | Partial<ScheduleContext>;
	newVersion?: Version = {};
	util: Utils;
	retryLimit: number;
	dryRun: boolean;
	conventions = {
		enforce: async (that: UtilThis) => conventions.enforce.bind(that),
	};

	// eslint-disable-next-line max-params
	constructor(
		util: Utils,
		runners: Runners,
		configs: Config,
		curContext: CurContext,
		dryRun: boolean,
	) {
		if (!runners) {
			throw new Error('Cannot construct without configs');
		}

		this.runners = runners;
		if (!configs) {
			throw new Error(log(
				LoggingLevels.error,
				'Cannot construct without configs',
			));
		}

		this.runnerConfigs = configs;
		if (!curContext) {
			throw new Error(log(
				LoggingLevels.error,
				'Cannot construct without context',
			));
		}

		this.curContext = curContext;
		const config = configs[curContext.type];
		if (!config) {
			throw new Error(log(
				LoggingLevels.error,
				'Cannot construct without config',
			));
		}

		this.config = config;
		if (curContext.type !== 'schedule') {
			this.newVersion = curContext.context.currentVersion;
		}

		this.context = curContext.context;
		this.util = util;
		this.dryRun = dryRun;
		this.retryLimit = configs.retryLimit ?? 3;
	}

	syncRemoteProject = async (that: Project) => syncRemoteProject.bind(that);
	assignProject = async (that: Issues | PullRequests) => assignProject.bind(that);

	applyLabels = async (that: UtilThis) => applyLabels.bind(that);
	checkStale = async (
		that: UtilThis,
		context?: IssueContext | ScheduleContext | PrContext | ProjectContext | ScheduleIssueContext,
		config?: SharedConfig | IssueConfig | PullRequestConfig | ProjectConfig,
	) => checkStale.call(that, context, config);

	automaticApprove = async (that: PullRequests) => automaticApprove.bind(that);
	requestApprovals = async (that: PullRequests) => requestApprovals.bind(that);
	bumpVersion = async (that: PullRequests) => bumpVersion.bind(that);

	async createComment(
		this: PullRequests | Issues | Project | Schedule,
		jobName: string,
		success: boolean,
		options?: {body?: string; event?: Event},
	) {
		const prefix = `<!--${String(process.env.NPM_PACKAGE_NAME)}: ${jobName}-->`;
		const body
			= prefix + String(options?.body === undefined ? '' : '\n\r\n\r' + String(options?.body));

		const commentList
			= this.context.props?.type === 'pr'
				? await this.util.api.pullRequests.reviews.list(this.context.props.number)
				: ('number' in this.context.props
					// @ts-expect-error if it gets here something has changed :)
					? await this.util.api.issues.comments.list(this.context.props.number)
					: undefined);
		let previousComment: number | undefined;

		if (commentList) {
			// eslint-disable-next-line unicorn/no-array-for-each
			commentList.forEach(comment => {
				if (
					comment.body?.includes(prefix)
					&& (!('state' in comment) || comment.state !== 'DISMISSED')
				) {
					previousComment = comment.id;
				}
			});
		}

		await this.util.respond(this, success, {
			event: options?.event,
			previousComment,
			body,
		});
	}
}
