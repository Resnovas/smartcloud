import type { Issues, PullRequests } from '../index.js';
import type { IssueConditionConfig } from '../../conditions/index.js';
/**
 * Assign project configuration
 */
export type AssignProject = {
    /**
     * The owner of the project
     */
    owner?: string;
    /**
     * The user of the project
     */
    user?: string;
    /**
     * The repository name
     * @requires owner
     */
    repo?: string;
    /**
     * The project to use
     * @requires owner|user|repo
     */
    project: string;
    /**
     * The column to use
     */
    column: string;
} & IssueConditionConfig;
export declare function assignProject(this: Issues | PullRequests): Promise<void>;
