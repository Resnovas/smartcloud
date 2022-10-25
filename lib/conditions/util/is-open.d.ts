import type { UtilProps, UtilThis } from '../index.js';
declare const type = "isOpen";
export declare type ConditionIsOpen = {
    type: typeof type;
    condition: boolean;
};
/** Checks if an issue or pull request is open or closed.
@examples require(".").example
Example:

```json
{
    "type": "isOpen",
    "condition": true
}
``` */
declare function isOpen(this: UtilThis, condition: ConditionIsOpen, context: UtilProps): boolean;
declare const _default: readonly ["isOpen", typeof isOpen];
export default _default;
export declare const example: ConditionIsOpen;
