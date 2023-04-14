import type { Issues, Project, PullRequests } from '../../contexts/index.js';
import type { PrProps } from '../index.js';
declare const type = "isDraft";
export type ConditionIsDraft = {
    type: typeof type;
    condition: boolean;
};
/** Checks if a pull request is a draft.

Example:

```json
{
    "type": "isDraft",
    "condition": true
}
```
@examples require(".").example
*/
declare function isDraft(this: Issues | PullRequests | Project, condition: ConditionIsDraft, context: PrProps): boolean;
declare const _default: readonly ["isDraft", typeof isDraft];
export default _default;
export declare const example: ConditionIsDraft;
