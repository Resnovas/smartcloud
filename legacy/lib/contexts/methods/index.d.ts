import type { Config, Runners, SharedConfig } from '../../types.js';
import type { CurContext, IssueContext, PrContext, ProjectContext, ScheduleContext, ScheduleIssueContext, UtilThis, Version } from '../../conditions/index.js';
import type { Schedule } from '../schedule.js';
import type { Utils, Event } from '../../utils/index.js';
import type { IssueConfig, Issues } from '../issues.js';
import type { ProjectConfig, Project } from '../projects.js';
import type { PullRequestConfig, PullRequests } from '../pull-requests.js';
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
export declare class Contexts {
    runners: Runners;
    runnerConfigs: Config;
    config: PullRequestConfig | IssueConfig | ProjectConfig;
    curContext: CurContext;
    context: ProjectContext | IssueContext | PrContext | Partial<ScheduleContext>;
    newVersion?: Version;
    util: Utils;
    retryLimit: number;
    dryRun: boolean;
    conventions: {
        enforce: (that: UtilThis) => Promise<boolean | undefined>;
    };
    constructor(util: Utils, runners: Runners, configs: Config, curContext: CurContext, dryRun: boolean);
    syncRemoteProject: (that: Project) => Promise<void>;
    assignProject: (that: Issues | PullRequests) => Promise<void>;
    applyLabels: (that: UtilThis) => Promise<void>;
    checkStale: (that: UtilThis, context?: IssueContext | ScheduleContext | PrContext | ProjectContext | ScheduleIssueContext, config?: SharedConfig | IssueConfig | PullRequestConfig | ProjectConfig) => Promise<void>;
    automaticApprove: (that: PullRequests) => Promise<void>;
    requestApprovals: (that: PullRequests) => Promise<void>;
    bumpVersion: (that: PullRequests) => Promise<void>;
    createComment(this: PullRequests | Issues | Project | Schedule, jobName: string, success: boolean, options?: {
        body?: string;
        event?: Event;
    }): Promise<void>;
}
