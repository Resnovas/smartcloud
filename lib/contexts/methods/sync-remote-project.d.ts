import type { Project } from '../projects.js';
/**
 * External projects configuration
 */
export type ExProjects = {
    /**
     * The local project to sync
     */
    localProject: string;
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
};
export declare function syncRemoteProject(this: Project): Promise<void>;
