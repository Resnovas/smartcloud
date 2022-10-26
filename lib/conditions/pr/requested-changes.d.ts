import type { Issues, Project, PullRequests } from '../../contexts/index.js';
import type { PrProps } from '../index.js';
declare const type = "requestedChanges";
export declare type ConditionRequestedChanges = {
    type: typeof type;
    condition: boolean;
};
/** Checks if a pull request has requested a review.
@examples require(".").example
Example:

```json
{
    "type": "requestedChanges",
    "condition": true
}
``` */
declare function requestedChanges(this: Issues | PullRequests | Project, condition: ConditionRequestedChanges, context: PrProps): boolean;
declare const _default: readonly ["requestedChanges", typeof requestedChanges];
export default _default;
export declare const example: ConditionRequestedChanges;
