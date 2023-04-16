/*
 * Project: @resnovas/smartcloud
 * File: index.ts
 * Path: \src\conditions\index.ts
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
 * Last Modified: 25-10-2022
 * By: Jonathan Stevens (Email: jonathan@resnovas.com, Github: https://github.com/TGTGamer)
 * Current Version: 1.0.0-beta.0
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import type {components} from '@octokit/openapi-types/types.js';
import type {Context} from '@actions/github/lib/context.js';
import type {PullRequestEvent, IssuesEvent, IssueCommentEvent, ProjectCardEvent} from '@octokit/webhooks-types';
import type {RestEndpointMethodTypes} from '@octokit/plugin-rest-endpoint-methods';
import type {Labels} from '../types.js';
import type {Issues, Project, PullRequests, Schedule} from '../contexts/index.js';
import type {IssueCondition} from './issue/index.js';
import type {PrCondition} from './pr/index.js';
import type {ProjectCondition} from './project/index.js';
import type {ScheduleCondition} from './schedule/index.js';
import type {Condition} from './util/index.js';
import {handlers as sharedHandlers} from './util/index.js';
import {handlers as prHandlers} from './pr/index.js';

export type {Condition} from './util/index.js';

export type GeneralContext = {
	currentVersion?: Version;
} & Context;

export type PrContext = {
	props: PrProps;
} & GeneralContext;

export type IssueContext = {
	props: IssueProps;
} & GeneralContext;

export type ScheduleIssueContext = {
	props: ScheduleIssueProps;
};

export type ProjectContext = {
	props: ProjectProps;
} & GeneralContext;

export type ScheduleContext = {
	props: ScheduleProps;
} & GeneralContext;

export type Props = {
	labels?: Labels;
};

export type PrProps = {
	type: 'pr';
	files: string[];
	reviews: Reviews;
	pendingReview: boolean;
	requestedChanges: number;
	approved: number;
	changes: number;
} & Props & PullRequestEvent;

export type IssueProps = {type: 'issue'} & (IssuesEvent | IssueCommentEvent) & Props;

export type ProjectProps = {
	type: 'project';
	project: any;
	column_id: number;
	localCard?: RestEndpointMethodTypes['projects']['getCard']['response']['data'];
	localColumn?: RestEndpointMethodTypes['projects']['getColumn']['response']['data'];
} & Props & ProjectCardEvent;

export type ScheduleProps = {type: 'schedule'} & Props;
export type ScheduleIssueProps = {type: 'issue'} & Props & Omit<components['schemas']['issue'], 'labels'>;

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

/**
 * This instead of manually requiring this
 */
export type UtilThis = Issues | PullRequests | Project | Schedule;
/**
 * Props used instead of manually requiring props
 */
export type UtilProps = IssueProps | PrProps | ProjectProps | ScheduleProps | ScheduleIssueProps;

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
	 * The conditions required for this to succeed.
	 * You can use the "semanticTitle" to automatically apply semantic conditions
	 * You can use the "gitmojis" to automatically apply gitmojis conditions
	 * You can use the "mojiSemantic" to automatically apply gitmojis and semantic conditions combined
	 */
	condition: Condition[] | 'semanticTitle' | 'semanticEmoji' | 'gitmojis' | string;
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

type Conditions = IssueCondition | PrCondition | ProjectCondition ;

export type CurContext =
	| {type: 'pr'; context: PrContext}
	| {type: 'issue'; context: IssueContext}
	| {type: 'project'; context: ProjectContext}
	| {type: 'schedule'; context: ScheduleContext};

const handlers = [
	...sharedHandlers,
	...prHandlers,
	// ...issueHandlers,
	// ...scheduleHandlers,
];

type HandlerTypes = [
	type: string,
	function: (this: UtilThis, condition: Conditions, context: ProjectProps | PrProps | IssueProps) => Promise<boolean>,
];

/**
 * The schedule condition handler.
 */
export function getConditionHandler(
	this: UtilThis,
	condition: IssueCondition | PrCondition | ProjectCondition,
) {
	const handler = handlers.find(handler => handler[0] === condition.type) as HandlerTypes;
	return handler?.[1];
}
