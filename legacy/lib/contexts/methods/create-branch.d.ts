/**
 * Create branch on project configuration
 */
export type ProjectCreateBranch = {
    /**
     * Project to use
     */
    onProject?: string;
    /**
     * Column to use
     */
    onColumn?: string;
} & CreateBranch;
/**
 * Create branch configuration
 */
export type CreateBranch = {
    /**
     * The branch prefix
     */
    branchPrefix?: string;
    /**
     * The branch suffix
     */
    branchSuffix?: string;
    /**
     * The branch name type
     */
    branchName: 'title' | 'short' | 'number';
};
