import type { Event, Utils } from '../index.js';
import type { Reviews } from '../../conditions/index.js';
export declare function list(this: Utils, IDNumber: number): Promise<any>;
export declare function changes(Additions: number, deletions: number): Promise<number>;
export declare const reviews: {
    create(this: Utils, IDNumber: number, { body, event, comments, }: {
        body?: string;
        event?: Event;
        comments?: Array<{
            path: string;
            position?: number | undefined;
            body: string;
            line?: number | undefined;
            side?: string | undefined;
            start_line?: number | undefined;
            start_side?: string | undefined;
        }>;
    }): Promise<any>;
    requestReviewers(this: Utils, IDNumber: number, reviewers: string[]): Promise<any>;
    update(this: Utils, IDNumber: number, review_id: number, body: string): Promise<any>;
    dismiss(this: Utils, IDNumber: number, review_id: number, message: string): Promise<any>;
    list(this: Utils, IDNumber: number): Promise<any>;
    pending(reviews: number, requested_reviews: number): Promise<boolean>;
    requestedChanges(reviews: Reviews): Promise<number>;
    isApproved(reviews: Reviews): Promise<number>;
};
