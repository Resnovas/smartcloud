import type { IssueConditionConfig, PrConditionConfig, ProjectConditionConfig, UtilProps, UtilThis } from '../index.js';
declare const type = "$or";
export type ConditionOr = {
    type: typeof type;
    condition: Array<PrConditionConfig | IssueConditionConfig | ProjectConditionConfig>;
};
/** Allows conditions to be combined to create more advanced conditions. Would require one conditions to return true otherwise it would fail. If both return true, this would return false.
@examples require(".").example
```json
{
    "type": "$or",
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
declare function or(this: UtilThis, condition: ConditionOr, context: UtilProps): Promise<boolean>;
declare const _default: readonly ["$or", typeof or];
export default _default;
export declare const example: ConditionOr;
