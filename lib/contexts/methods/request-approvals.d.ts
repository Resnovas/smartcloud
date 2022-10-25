import type { PullRequests } from '../index.js';
import type { SharedConventionsConfig } from './index.js';
export declare type RequestApprovals = Record<string, Group>;
declare type Group = {
    /**
     * The reviewers to reques
     */
    reviewers: string[];
    /**
     * The comment to create
     */
    comment?: {
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
    };
    condition: SharedConventionsConfig[];
};
export declare function requestApprovals(this: PullRequests): Promise<void>;
export {};
