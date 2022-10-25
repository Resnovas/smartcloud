import type { UtilProps, UtilThis } from '../index.js';
declare const type = "isStale";
export declare type ConditionIsStale = {
    type: typeof type;
    condition: number;
};
/** Checks if an issue or pull request is stale.

Example:
@examples require(".").example
```json
{
    "type": "isStale",
    "condition": 30
}
``` */
declare function isStale(this: UtilThis, condition: ConditionIsStale, context: UtilProps): boolean;
declare const _default: readonly ["isStale", typeof isStale];
export default _default;
export declare const example: ConditionIsStale;
