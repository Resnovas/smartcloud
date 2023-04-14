import type { Issues, Project, PullRequests } from '../../contexts/index.js';
import type { PrProps } from '../index.js';
declare const type = "isApproved";
export type ConditionisApproved = {
    type: typeof type;
    condition: number;
};
/** Checks if a pull request has requested a review.

Example:

```json
{
    "type": "isApproved",
    "required": 1
}
```
@examples require(".").example
*/
declare function isApproved(this: Issues | PullRequests | Project, condition: ConditionisApproved, context: PrProps): boolean;
declare const _default: readonly ["isApproved", typeof isApproved];
export default _default;
export declare const example: ConditionisApproved;
