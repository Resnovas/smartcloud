import type { Issues, Project, PullRequests } from '../../contexts/index.js';
import type { PrProps } from '../index.js';
declare const type = "branchMatches";
export declare type ConditionBranchMatches = {
    type: typeof type;
    condition: string;
};
/** Checks if branch name matches a Regex condition.

    @examples require(".").example

    Example:

```json
{
    "type": "branchMatches",
    "condition": "^bugfix\\/"
}
``` */
declare function branchMatches(this: Issues | PullRequests | Project, pattern: ConditionBranchMatches, context: PrProps): Promise<boolean>;
declare const _default: readonly ["branchMatches", typeof branchMatches];
export default _default;
export declare const example: ConditionBranchMatches;
