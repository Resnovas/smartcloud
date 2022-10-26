import type { Context } from '@actions/github/lib/context.js';
import type { Config, Runners, SharedConfig } from '../types.js';
import type { CurContext, ProjectContext } from '../conditions/index.js';
import type { Utils } from '../utils/index.js';
import { Contexts } from './methods/index.js';
import type { Column } from './methods/conventions.js';
import type { ProjectCreateBranch } from './methods/create-branch.js';
import type { Milestones } from './methods/handle-milestone.js';
import type { ExProjects } from './methods/sync-remote-project.js';
/**
 * The project configuration
 */
export declare type ProjectConfig = {
    /**
     * Syncronise remote repository configuration.
     */
    syncRemote?: ExProjects[];
    /**
     * Open branch configuration
     */
    openBranch?: ProjectCreateBranch;
    /**
     * Assign to milestone configuration
     */
    assignMilestone?: Record<string, Milestones>;
} & SharedConfig;
export declare class Project extends Contexts {
    /**
     * Parse the Project Context
     * @author IvanFon, TGTGamer, jbinda
     * @since 1.0.0
     */
    static parse(utils: Utils, config: Config, context: Context): Promise<ProjectContext | undefined>;
    context: ProjectContext;
    config: ProjectConfig;
    constructor(util: Utils, runners: Runners, configs: Config, curContext: CurContext, dryRun: boolean);
    run(attempt?: number): Promise<void>;
    convertColumnStringsToIdArray(columns: Column[]): Promise<number[]>;
}
