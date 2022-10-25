import type { IssueConditionConfig, PrConditionConfig, ProjectConditionConfig, UtilProps, UtilThis } from '../index.js';
declare const type = "$only";
export declare type ConditionOnlyOne = {
    requires: number;
    type: typeof type;
    condition: Array<PrConditionConfig | IssueConditionConfig | ProjectConditionConfig>;
};
/** Requires only the number specified in `requires` to pass otherwise it fails.
@examples require(".").example
```json
{
    "type": "$only",
    "requires": 1,
    "condition": [
        {
            "requires": 1,
            "conditions": []
        },
        {
            "requires": 1,
            "conditions": []
        }
    ]
}
``` */
declare function only(this: UtilThis, condition: ConditionOnlyOne, context: UtilProps): Promise<boolean>;
declare const _default: readonly ["$only", typeof only];
export default _default;
export declare const example: ConditionOnlyOne;
