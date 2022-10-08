/**
 * Project: @resnovas/smartcloud
 * File: index.ts
 * Path: \src\conditions\index.ts
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

import type {Labels} from '../types';
import type {Issues, Project, PullRequests, Schedule} from '../contexts';
import type {IssueCondition} from './issue';
import type {PrCondition} from './pr';
import type {ProjectCondition} from './project';
import type {ScheduleCondition} from './schedule';
import type {Condition} from './util';

type GeneralContext = {
	ref?: string;
	sha: string;
	action: string;
};

export type PrContext = {
	currentVersion?: Version;
	idNumber: number;
	props: PrProps;
} & GeneralContext;

export type IssueContext = {
	currentVersion?: Version;
	IDNumber: number;
	props: IssueProps;
} & GeneralContext;

export type ProjectContext = {
	currentVersion?: Version;
	IDNumber: number;
	props: ProjectProps;
} & GeneralContext;

export type ScheduleContext = {
	props?: ScheduleProps;
} & GeneralContext;

type Props = {
	creator: string;
	description: string;
	locked: boolean;
	state: 'open' | 'closed';
	title: string;
	labels?: Labels;
	id: number;
	type: 'issue' | 'pr' | 'project';
	lastUpdated?: string;
};

export type PrProps = {
	branch: string;
	isDraft: boolean;
	files: string[];
	reviews: Reviews;
	pendingReview: boolean;
	requestedChanges: number;
	approved: number;
	changes: number;
} & Props;

export type IssueProps = Props;

export type ProjectProps = {
	project: any;
	column_id: number;
	localCard: Partial<LocalCard>;
	localColumn: LocalColumn;
	changes: {
		column_id: {
			from: number;
		};
	};
} & Props;

export type ScheduleProps = Props;

export type Version = {
	name?: string;
	semantic?: {
		major: number;
		minor: number;
		patch: number;
		prerelease?: string;
		build?: number;
	};
};

export type Reviews = Review[];

export type Review = {
	id?: number;
	node_id?: string;
	user?: any;
	body?: string;
	state?: string;
	html_url?: string;
	pull_request_url?: string;
	author_association?: string;
	_links?: Record<string, unknown>;
	submitted_at?: string;
	commit_id?: string;
};

type LocalCard = {
	archived: boolean;
	column_url: string;
	content_url: string;
	created_at: string;
	creator: any;
	id: number;
	node_id: string;
	note: string | undefined;
	project_url: string;
	updated_at: string;
	url: string;
};

type LocalColumn = {
	name: any;
	cards_url: string;
	created_at: string;
	id: number;
	node_id: string;
	project_url: string;
	updated_at: string;
	url: string;
};
/**
 * This instead of manually requiring this
 */
export type UtilThis = Issues | PullRequests | Project | Schedule;
/**
 * Props used instead of manually requiring props
 */
export type UtilProps = IssueProps | PrProps | ProjectProps | ScheduleProps;

/**
 * Shared conditions used by all types of events.
 */
export type SharedConditions = {
	/**
	 * The number of requires needed for this to succeed
	 */
	requires: number;
	/**
	 * The conditions required for this to succeed
	 */
	condition: Condition[];
};

/**
 * Conventions to use
 */
export type SharedConventionConditions = {
	/**
	 * The number of requires needed for this to succeed
	 */
	requires: number;
	/**
	 * The conditions required for this to succeed. You can use the "semanticTitle" to automatically apply thses conditions
	 */
	condition: Condition[] | string;
};

/**
 * The PR condition configuration
 */
export type PrConditionConfig = {
	/**
	 * The number of requires needed for this to succeed
	 */
	requires: number;
	/**
	 * The conditions required for this to succeed
	 */
	condition: PrCondition[];
};

/**
 * The Issue condition configuration
 */
export type IssueConditionConfig = {
	/**
	 * The number of requires needed for this to succeed
	 */
	requires: number;
	/**
	 * The conditions required for this to succeed
	 */
	condition: IssueCondition[];
};

/**
 * The Project condition configuration
 */
export type ProjectConditionConfig = {
	/**
	 * The number of requires needed for this to succeed
	 */
	requires: number;
	/**
	 * The conditions required for this to succeed
	 */
	condition: ProjectCondition[];
};

/**
 * The Schedule condition configuration
 */
export type ScheduleConditionConfig = {
	/**
	 * The number of requires needed for this to succeed
	 */
	requires: number;
	/**
	 * The conditions required for this to succeed
	 */
	condition: ScheduleCondition[];
};

export type CurContext =
	| {type: 'pr'; context: PrContext}
	| {type: 'issue'; context: IssueContext}
	| {type: 'project'; context: ProjectContext}
	| {type: 'schedule'; context: ScheduleContext};
