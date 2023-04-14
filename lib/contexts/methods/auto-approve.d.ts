import type { PullRequests } from '../index.js';
import type { SharedConventionsConfig } from './conventions.js';
/**
 * Automatic Approval configuration
 */
export type AutomaticApprove = {
    /**
     * The comment to append to the header
     */
    commentHeader?: string;
    /**
     * The comment to append to the footer
     */
    commentBody?: string;
    /**
     * The comment to append to the footer
     */
    commentFooter?: string;
    /**
     * The conventions to use when approving
     */
    condition: SharedConventionsConfig[];
};
export declare function automaticApprove(this: PullRequests): Promise<void>;
