import type { UtilProps, UtilThis } from '../index.js';
declare const type = "isAbandoned";
export type ConditionIsAbandoned = {
    type: typeof type;
    condition: number;
    label: string;
};
/** Checks if an issue or pull request is abandoned.

Example:
@examples require(".").example
```json
{
    "type": "isAbandoned",
    "condition": 30
}
``` */
declare function isAbandoned(this: UtilThis, condition: ConditionIsAbandoned, context: UtilProps): boolean;
declare const _default: readonly ["isAbandoned", typeof isAbandoned];
export default _default;
export declare const example: ConditionIsAbandoned;
