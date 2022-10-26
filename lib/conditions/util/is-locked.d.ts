import type { UtilProps, UtilThis } from '../index.js';
declare const type = "isLocked";
export declare type ConditionIsLocked = {
    type: typeof type;
    condition: boolean;
};
/** Checks if an issue or pull request is locked.

Example:
@examples require(".").example
```json
{
    "type": "isLocked",
    "condition": true
}
``` */
declare function isLocked(this: UtilThis, condition: ConditionIsLocked, context: UtilProps): boolean;
declare const _default: readonly ["isLocked", typeof isLocked];
export default _default;
export declare const example: ConditionIsLocked;
