/**
 * Assign to milestone based on project
 */
export type Milestones = {
    /**
     * Which column o use
     */
    onColumn: string;
    /**
     * Which labels should e ignored?
     */
    ignoreLabels?: string[];
};
/**
 * Create Milestones
 */
export type CreateMilestone = {
    /**
     * The milestone you want to use
     * @example 'version'
     */
    milestone: string;
    /**
     * The date in which you want to set as the completion date
     */
    deadline?: string;
};
