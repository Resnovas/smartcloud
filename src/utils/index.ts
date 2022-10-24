/*
 * Project: @resnovas/smartcloud
 * File: index.ts
 * Path: \src\utils\index.ts
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

import type {SimpleGit, SimpleGitOptions} from 'simple-git';
import {simpleGit} from 'simple-git';
import type {Github, Config, Label, Runners} from '../types.js';
import type {Reviews, UtilThis} from '../conditions/index.js';
import * as APIFiles from './api/files.js';
import * as APIIssues from './api/issues.js';
import * as APILabels from './api/labels.js';
import * as APIProject from './api/project.js';
import * as APIPullRequests from './api/pull-requests.js';
import * as APITag from './api/tags.js';
import * as UtilLabels from './labels.js';
import * as UtilParsingData from './parsing-data.js';
import * as UtilRespond from './respond.js';
import * as UtilVersioning from './versioning.js';

export class Utils {
	client: Github;
	repo: Repo;
	dryRun: boolean;
	skipDelete: boolean;
	ref?: string;
	git: SimpleGit;
	api = {
		files: {
			get: async (file: string, ref?: string) =>
				APIFiles.get.call(this, file, ref),
			list: async (IDNumber: number) => APIFiles.list.call(this, IDNumber),
		},
		issues: {
			get: async (IDNumber: number) => APIIssues.get.call(this, IDNumber),
			// eslint-disable-next-line max-params
			create: async (
				title: string,
				body: string,
				labels: string[],
				assignees: string[],
				milestone: string,
			) =>
				APIIssues.create.call(this, title, body, labels, assignees, milestone),
			list: async ({
				state,
				sort,
				direction,
			}: {
				state?: 'open' | 'closed' | 'all';
				sort?: 'created' | 'updated' | 'comments';
				direction?: 'asc' | 'desc';
			}) => APIIssues.list.call(this, {state, sort, direction}),
			comments: {
				list: async (IDNumber: number) =>
					APIIssues.comments.list.call(this, IDNumber),
				get: async (IDNumber: number) =>
					APIIssues.comments.get.call(this, IDNumber),
				create: async (IDNumber: number, body: string) =>
					APIIssues.comments.create.call(this, IDNumber, body),
				update: async (comment_id: number, body: string) =>
					APIIssues.comments.update.call(this, comment_id, body),
				delete: async (comment_id: number) =>
					APIIssues.comments.delete.call(this, comment_id),
			},
		},
		labels: {
			add: async (IDNumber: number, label: string) =>
				APILabels.add.call(this, IDNumber, label),
			create: async (label: Label) => APILabels.create.call(this, label),
			del: async (name: string) => APILabels.del.call(this, name),
			get: async () => APILabels.get.call(this),
			remove: async (IDNumber: number, label: string) =>
				APILabels.remove.call(this, IDNumber, label),
			update: async (current_name: string, label: Label) =>
				APILabels.update.call(this, current_name, label),
		},
		project: {
			column: {
				list: async (project_id: number) =>
					APIProject.column.list.call(this, project_id),
				get: async (column_id: number) =>
					APIProject.column.get.call(this, column_id),
				listCards: async (column_id: number) =>
					APIProject.column.listCards.call(this, column_id),
			},
			card: {
				get: async (card_id: number) => APIProject.card.get.call(this, card_id),
				create: async (
					content_id: number,
					column_id: number,
					content_type?: 'Issue' | 'PullRequest',
				) =>
					APIProject.card.create.call(
						this,
						content_id,
						column_id,
						content_type,
					),
				move: async (card_id: number, column_id: number) =>
					APIProject.card.move.call(this, card_id, column_id),
			},
			projects: {
				get: async (project_id: number) =>
					APIProject.projects.get.call(this, project_id),
				org: async (org: string) => APIProject.projects.org.call(this, org),
				user: async (user: string) => APIProject.projects.user.call(this, user),
				repo: async (owner: string, repo: string) =>
					APIProject.projects.repo.call(this, owner, repo),
			},
		},
		pullRequests: {
			list: async (IDNumber: number) =>
				APIPullRequests.list.call(this, IDNumber),
			changes: async (additions: number, deletions: number) =>
				APIPullRequests.changes(additions, deletions),
			reviews: {
				create: async (
					IDNumber: number,
					body?: string,
					event?: Event,
					comments?: Array<{
						path: string;
						position?: number | undefined;
						body: string;
						line?: number | undefined;
						side?: string | undefined;
						start_line?: number | undefined;
						start_side?: string | undefined;
					}>,
				) =>
					APIPullRequests.reviews.create.call(
						this,
						IDNumber,
						{
							body,
							event,
							comments,
						},
					),
				requestReviewers: async (IDNumber: number, reviewers: string[]) =>
					APIPullRequests.reviews.requestReviewers.call(
						this,
						IDNumber,
						reviewers,
					),
				update: async (IDNumber: number, review_id: number, body: string) =>
					APIPullRequests.reviews.update.call(this, IDNumber, review_id, body),
				dismiss: async (IDNumber: number, review_id: number, message: string) =>
					APIPullRequests.reviews.dismiss.call(
						this,
						IDNumber,
						review_id,
						message,
					),
				list: async (IDNumber: number) =>
					APIPullRequests.reviews.list.call(this, IDNumber),
				requestedChanges: async (reviews: Reviews) =>
					APIPullRequests.reviews.requestedChanges.call(this, reviews),
				isApproved: async (reviews: Reviews) =>
					APIPullRequests.reviews.isApproved(reviews),
				pending: async (reviews: number, requested_reviews: number) =>
					APIPullRequests.reviews.pending(reviews, requested_reviews),
			},
		},
		tags: {
			get: async () => APITag.get.call(this),
		},
	};

	labels = {
		sync: async (config: Runners['labels']) =>
			UtilLabels.sync.call(this, config),
		addRemove: async (
			labelName: string,
			IDNumber: number,
			hasLabel: boolean,
			shouldHaveLabel: boolean,
		) =>
			UtilLabels.addRemove.call(
				this,
				labelName,
				IDNumber,
				hasLabel,
				shouldHaveLabel,
			),
	};

	parsingData = {
		formatColor: async (color: string) => UtilParsingData.formatColor(color),
		processRegExpcondition: async (condition: string) =>
			UtilParsingData.processRegExpcondition(condition),
		normalize: async (text: string) => UtilParsingData.normalize(text),
		labels: async (labels: any) => UtilParsingData.parseLabels(labels),
	};

	versioning = {
		parse: async (config: Config, ref?: string) =>
			UtilVersioning.parse.call(this, config, ref),
	};

	constructor(
		props: ApiProps,
		options: {dryRun: boolean; skipDelete: boolean; ref?: string},
		{git}: {git?: SimpleGitOptions},
	) {
		this.client = props.client;
		this.repo = props.repo;
		this.dryRun = options.dryRun;
		this.skipDelete = options.skipDelete;
		this.ref = options.ref;
		this.git = git
			? simpleGit({
				...git,
				// eslint-disable-next-line n/prefer-global/process
				baseDir: git.baseDir ? git.baseDir : process.cwd(),
				binary: 'git',
				maxConcurrentProcesses: 6,
				config: git.config ? git.config : [],
			})
			: simpleGit();
	}

	respond = async (
		that: UtilThis,
		success: boolean,
		{
			event,
			previousComment,
			body,
		}: {
			event?: Event;
			previousComment?: number;
			body?: string;
		},
	) => {
		await UtilRespond.respond.call(that, success, event, {previousComment, body});
	};
}
export type Repo = {
	owner: string;
	repo: string;
};
export type ApiProps = {
	client: Github;
	repo: Repo;
};

export type Functionality = 'release' | 'convention' | 'label';
export type Event = 'REQUEST_CHANGES' | 'APPROVE' | 'COMMENT';
export type Tags = string[];
