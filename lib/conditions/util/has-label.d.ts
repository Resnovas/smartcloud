import type { UtilProps, UtilThis } from '../index.js';
declare const type = "hasLabel";
export declare type ConditionHasLabel = {
    type: typeof type;
    label: string;
    condition: boolean;
};
/** Checks if an issue or pull request has a specific label applied.

Example:
@examples require(".").example
```json
{
    "type": "hasLabel",
    "label": "Type - Bug",
    "condition": "false"
}
```
 */
declare function hasLabel(this: UtilThis, condition: ConditionHasLabel, context: UtilProps): boolean;
declare const _default: readonly ["hasLabel", typeof hasLabel];
export default _default;
export declare const example: ConditionHasLabel;
