/**
 * Create branch on project configuration
 */
export declare type ProjectCreateBranch = {
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
export declare type CreateBranch = {
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
