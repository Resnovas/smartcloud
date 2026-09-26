import type { UtilProps, UtilThis } from '../index.js';
declare const type = "creatorMatches";
export type ConditionCreatorMatches = {
    type: typeof type;
    condition: string;
};
/** Checks if an issue or pull request's creator's username matches a Regex condition.

Example:
@examples require(".").example
```json
{
    "type": "creatorMatches",
    "condition": "^foo"
}
```
 */
declare function creatorMatches(this: UtilThis, pattern: ConditionCreatorMatches, context: UtilProps): Promise<boolean>;
declare const _default: readonly ["creatorMatches", typeof creatorMatches];
export default _default;
export declare const example: ConditionCreatorMatches;
