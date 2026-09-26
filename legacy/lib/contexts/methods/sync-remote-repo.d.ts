import type { SharedConditions } from '../../conditions/index.js';
/**
 * Sync Remote configuration
 */
export type SyncRemote = {
    /**
     * Local branch to sync
     */
    localBranch: string;
    /**
     * Remote branch to sync
     */
    remoteBranch: string;
    /**
     * The path to the local files to sync
     */
    localPath: string;
    /**
     * The path to the remote file destination
     */
    remotePath: string;
    /**
     * The conditions to use when syncing
     */
    condition: SharedConditions[];
};
