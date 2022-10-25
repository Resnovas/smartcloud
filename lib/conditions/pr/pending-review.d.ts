import type { Issues, Project, PullRequests } from '../../contexts/index.js';
import type { PrProps } from '../index.js';
declare const type = "pendingReview";
export declare type ConditionPendingReview = {
    type: typeof type;
    condition: boolean;
};
/** Checks if a pull request has requested a review.
@examples require(".").example
Example:

```json
{
    "type": "pendingReview",
    "condition": true
}
``` */
declare function pendingReview(this: Issues | PullRequests | Project, condition: ConditionPendingReview, context: PrProps): boolean;
declare const _default: readonly ["pendingReview", typeof pendingReview];
export default _default;
export declare const example: ConditionPendingReview;
