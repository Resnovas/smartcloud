import type { UtilProps, UtilThis } from '../index.js';
declare const type = "titleMatches";
export type ConditionTitleMatches = {
    type: typeof type;
    condition: string;
};
/** Checks if an issue or pull request's title matches a Regex condition.
@examples require(".").example
Example:

```json
{
    "type": "titleMatches",
    "condition": "^foo"
}
```
 */
declare function titleMatches(this: UtilThis, pattern: ConditionTitleMatches, context: UtilProps): Promise<boolean>;
declare const _default: readonly ["titleMatches", typeof titleMatches];
export default _default;
export declare const example: ConditionTitleMatches;
