import type { IssueConfig, Issues, Project, ProjectConfig, PullRequestConfig, PullRequests, Schedule } from '../index.js';
import type { IssueContext, PrContext, ProjectContext, ScheduleContext, ScheduleIssueContext, SharedConditions } from '../../conditions/index.js';
import type { SharedConfig } from '../../types.js';
/**
 * The stale configuration
 */
export type Stale = {
    /**
     * The label to use for stale issues
     */
    staleLabel: string;
    /**
     * The stale configuration to use
     */
    stale?: StaleConfig;
    /**
     * The abanonded configuration to use
     */
    abandoned?: AbanondedConfig;
    /**
     * The conditions to use when checking stale
     */
    condition?: SharedConditions[];
};
/**
 * The stale configuration
 */
export type StaleConfig = {
    /**
     * The days to consider stale
     */
    days: number;
    /**
     * The comment to append to the stale issue
     */
    comment?: string;
    /**
     * The comment to switch when resolved
     */
    resolve?: string;
    /**
     * The comment to append to the header
     */
    commentHeader?: string;
    /**
     * The comment to append to the footer
     */
    commentFooter?: string;
} & SharedConditions;
/**
 * The abanonded configuration
 */
export type AbanondedConfig = {
    /**
     * Should the abanonded issue be closed
     */
    close?: boolean;
    /**
     * Should the abanonded issue be locked
     */
    lock?: boolean;
    /**
     * The label to use for abanonded issues
     */
    label: string;
} & StaleConfig;
export declare function checkStale(this: Issues | PullRequests | Project | Schedule, context?: IssueContext | ScheduleContext | PrContext | ProjectContext | ScheduleIssueContext, configlocal?: SharedConfig | IssueConfig | PullRequestConfig | ProjectConfig): Promise<void>;
