/**
 * Project: @resnovas/smartcloud
 * File: index.ts
 * Path: \src\contexts\methods\index.ts
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

import {LoggingDataClass, LoggingLevels} from '@resnovas/utilities';
import type {Config, Runners} from '../../types';
import type {
	CurContext,
	IssueContext,
	PrContext,
	ProjectContext,
	ScheduleContext,
	UtilThis,
	Version,
} from '../../conditions';
import type {Schedule} from '../schedule';
import type {Utils} from '../../utils';
import type {IssueConfig, Issues} from '../issues';
import type {ProjectConfig, Project} from '../projects';
import type {PullRequestConfig, PullRequests} from '../pull-requests';
import {applyLabels} from './apply-labels';
import {assignProject} from './assign-project';
import {automaticApprove} from './auto-approve';
import {bumpVersion} from './bump-version';
import {checkStale} from './check-stale';
import * as conventions from './conventions';
import {requestApprovals} from './requestApprovals';
import {syncRemoteProject} from './syncRemoteProject';

export {log} from '../../logging';
export * from './apply-labels';
export * from './assign-project';
export * from './auto-approve';
export * from './changelog';
export * from './check-stale';
export * from './conventions';
export * from './create-branch';
export * from './handle-milestone';
export * from './release';
export * from './syncRemoteProject';
export * from './sync-remote-repo';

export class Contexts {
	runners: Runners;
	configs: Config;
	config: PullRequestConfig | IssueConfig | ProjectConfig;
	curContext: CurContext;
	context: ProjectContext | IssueContext | PrContext | Partial<ScheduleContext>;
	newVersion?: Version = {};
	util: Utils;
	retryLimit: number;
	dryRun: boolean;
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
			throw new LoggingDataClass(
				LoggingLevels.error,
				'Cannot construct without configs',
			);
		}

		this.configs = configs;
		if (!curContext) {
			throw new LoggingDataClass(
				LoggingLevels.error,
				'Cannot construct without context',
			);
		}

		this.curContext = curContext;
		const config = configs[curContext.type];
		if (!config) {
			throw new LoggingDataClass(
				LoggingLevels.error,
				'Cannot construct without config',
			);
		}

		this.config = config;
		// TODO: This needs removing from the label-mastermind config
		if (curContext.type !== 'schedule') {
			this.newVersion = curContext.context.currentVersion;
		}

		this.context = curContext.context;
		this.util = util;
		this.dryRun = dryRun;
		this.retryLimit = configs.retryLimit ?? 3;
	}

	syncRemoteProject = async (that: Project) => syncRemoteProject.call(that);
	assignProject = async (that: Issues | PullRequests) =>
		assignProject.call(that);

	applyLabels = async (that: UtilThis) => applyLabels.call(that);
	checkStale = async (that: Issues | PullRequests | Project | Schedule) =>
		checkStale.call(that);

	automaticApprove = async (that: PullRequests) => automaticApprove.call(that);
	requestApprovals = async (that: PullRequests) => requestApprovals.call(that);
	bumpVersion = async (that: PullRequests) => bumpVersion.call(that);

	conventions = {
		enforce: async (that: Issues | PullRequests | Project) =>
			conventions.enforce.call(that),
	};

	async createComment(
		this: PullRequests | Issues | Project | Schedule,
		jobName: string,
		success: boolean,
		options?: {body?: string; event?: Event},
	) {
		const prefix = `<!--${process.env.NPM_PACKAGE_NAME}: ${jobName}-->`;
		const body
			= prefix + options?.body !== undefined ? '\n\r\n\r' + options?.body : '';

		const commentList
			= this.context.props?.type === 'pr'
				? await this.util.api.pullRequests.reviews.list(this.context.props.ID)
				: (this.context.props?.ID
					? await this.util.api.issues.comments.list(this.context.props.ID)
					: undefined);
		let previousComment: number | undefined;

		if (commentList) {
			commentList.forEach((comment: any) => {
				if (
					comment.body.includes(prefix)
					&& (!('state' in comment) || comment.state !== 'DISMISSED')
				) {
					previousComment = comment.id;
				}
			});
		}

		this.util.respond(this, success, {
			event: options?.event,
			previousComment,
			body,
		});
	}
}
