import type { Context } from '@actions/github/lib/context.js';
import type { Config, Runners, SharedConfig } from '../types.js';
import type { CurContext, PrContext } from '../conditions/index.js';
import type { Utils } from '../utils/index.js';
import { Contexts } from './methods/index.js';
import type { AssignProject } from './methods/assign-project.js';
import type { AutomaticApprove } from './methods/auto-approve.js';
import type { Release } from './methods/release.js';
import type { RequestApprovals } from './methods/request-approvals.js';
import type { SyncRemote } from './methods/sync-remote-repo.js';
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
export declare class PullRequests extends Contexts {
    /**
     * Parse the PR Context
     * @author IvanFon, TGTGamer, jbinda
     * @since 1.0.0
     */
    static parse(utils: Utils, config: Config, context: Context): Promise<PrContext | undefined>;
    context: PrContext;
    config: PullRequestConfig;
    constructor(util: Utils, runners: Runners, configs: Config, curContext: CurContext, dryRun: boolean);
    run(attempt?: number): Promise<void>;
}
