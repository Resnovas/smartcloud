import type { components } from '@octokit/openapi-types/types.js';
import type { Context } from '@actions/github/lib/context.js';
import type { PullRequestEvent, IssuesEvent, IssueCommentEvent, ProjectCardEvent } from '@octokit/webhooks-types';
import type { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods';
import type { Labels } from '../types.js';
import type { Issues, Project, PullRequests, Schedule } from '../contexts/index.js';
import type { IssueCondition } from './issue/index.js';
import type { PrCondition } from './pr/index.js';
import type { ProjectCondition } from './project/index.js';
import type { ScheduleCondition } from './schedule/index.js';
import type { Condition } from './util/index.js';
export type { Condition } from './util/index.js';
export declare type GeneralContext = {
    currentVersion?: Version;
} & Context;
export declare type PrContext = {
    props: PrProps;
} & GeneralContext;
export declare type IssueContext = {
    props: IssueProps;
} & GeneralContext;
export declare type ScheduleIssueContext = {
    props: ScheduleIssueProps;
};
export declare type ProjectContext = {
    props: ProjectProps;
} & GeneralContext;
export declare type ScheduleContext = {
    props: ScheduleProps;
} & GeneralContext;
export declare type Props = {
    labels?: Labels;
};
export declare type PrProps = {
    type: 'pr';
    files: string[];
    reviews: Reviews;
    pendingReview: boolean;
    requestedChanges: number;
    approved: number;
    changes: number;
} & Props & PullRequestEvent;
export declare type IssueProps = {
    type: 'issue';
} & (IssuesEvent | IssueCommentEvent) & Props;
export declare type ProjectProps = {
    type: 'project';
    project: any;
    column_id: number;
    localCard?: RestEndpointMethodTypes['projects']['getCard']['response']['data'];
    localColumn?: RestEndpointMethodTypes['projects']['getColumn']['response']['data'];
} & Props & ProjectCardEvent;
export declare type ScheduleProps = {
    type: 'schedule';
} & Props;
export declare type ScheduleIssueProps = {
    type: 'issue';
} & Props & Omit<components['schemas']['issue'], 'labels'>;
export declare type Version = {
    name?: string;
    semantic?: {
        major: number;
        minor: number;
        patch: number;
        prerelease?: string;
        build?: number;
    };
};
export declare type Reviews = Review[];
export declare type Review = {
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
export declare type UtilThis = Issues | PullRequests | Project | Schedule;
/**
 * Props used instead of manually requiring props
 */
export declare type UtilProps = IssueProps | PrProps | ProjectProps | ScheduleProps | ScheduleIssueProps;
/**
 * Shared conditions used by all types of events.
 */
export declare type SharedConditions = {
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
export declare type SharedConventionConditions = {
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
export declare type PrConditionConfig = {
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
export declare type IssueConditionConfig = {
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
export declare type ProjectConditionConfig = {
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
export declare type ScheduleConditionConfig = {
    /**
     * The number of requires needed for this to succeed
     */
    requires: number;
    /**
     * The conditions required for this to succeed
     */
    condition: ScheduleCondition[];
};
declare type Conditions = IssueCondition | PrCondition | ProjectCondition | ScheduleCondition | Condition;
export declare type CurContext = {
    type: 'pr';
    context: PrContext;
} | {
    type: 'issue';
    context: IssueContext;
} | {
    type: 'project';
    context: ProjectContext;
} | {
    type: 'schedule';
    context: ScheduleContext;
};
/**
 * The schedule condition handler.
 */
export declare function getConditionHandler(this: UtilThis, condition: IssueCondition | PrCondition | ProjectCondition | ScheduleCondition): (this: UtilThis, condition: Conditions, context: PrProps | IssueProps | ProjectProps) => Promise<boolean>;
