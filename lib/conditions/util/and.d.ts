import type { IssueConditionConfig, PrConditionConfig, ProjectConditionConfig, UtilProps, UtilThis } from '../index.js';
declare const type = "$and";
export type ConditionAnd = {
    type: typeof type;
    condition: Array<PrConditionConfig | IssueConditionConfig | ProjectConditionConfig>;
};
/**
Allows conditions to be combined to create more advanced conditions. Requires all conditions to return true otherwise it would fail.
@examples require(".").example
```json
{
    "type": "$and",
    "condition": [
        {
            "requires": 1,
            "condition": []
        },
        {
            "requires": 1,
            "condition": []
        }
    ]
}
``` */
declare function and(this: UtilThis, condition: ConditionAnd, context: UtilProps): Promise<boolean>;
declare const _default: readonly ["$and", typeof and];
export default _default;
export declare const example: ConditionAnd;
