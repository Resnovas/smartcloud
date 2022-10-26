import type { Context } from '@actions/github/lib/context.js';
import type { Config, Runners, SharedConfig } from '../types.js';
import type { CurContext, IssueContext } from '../conditions/index.js';
import type { Utils } from '../utils/index.js';
import { Contexts } from './methods/index.js';
import type { AssignProject } from './methods/assign-project.js';
import type { CreateBranch } from './methods/create-branch.js';
/**
 * The issue configuration
 */
export declare type IssueConfig = {
    /**
     * Assign project configuration.
     */
    assignProject?: AssignProject[];
    /**
     * Open branch configuration
     */
    createBranch?: Record<string, CreateBranch>;
} & SharedConfig;
export declare class Issues extends Contexts {
    /**
     * Parse the Issue Context
     * @author IvanFon, TGTGamer, jbinda
     * @since 1.0.0
     */
    static parse(utils: Utils, config: Config, context: Context): Promise<IssueContext | undefined>;
    context: IssueContext;
    config: IssueConfig;
    constructor(util: Utils, runners: Runners, configs: Config, curContext: CurContext, dryRun: boolean);
    run(attempt?: number): Promise<void>;
}
