import type { SharedConventionConditions, UtilThis } from '../../conditions/index.js';
/**
 * The enforce conventions configuration
 */
export declare type Column = string | number;
export declare type EnforceConventions = {
    /**
     * The columns to enforce conventions
     */
    onColumn?: Column[];
    /**
     * The comment to append to the header
     */
    commentHeader?: string;
    /**
     * The comment to append to the footer
     */
    commentFooter?: string;
    /**
     * The column to move if fails
     */
    moveToColumn?: string;
    /**
     * The conventions to enforce
     */
    condition: SharedConventionsConfig[];
};
export declare type SharedConventionsConfig = {
    /**
     * The failed comment to use
     */
    failedComment: string;
    /**
     * The contexts to use. Use this in combernation with "semanticTitle"
     * @requires conditions: "semanticTitle"
     */
    contexts?: string[];
} & SharedConventionConditions;
export declare function enforce(this: UtilThis): Promise<boolean | undefined>;
