import type { IssueConditionConfig, PrConditionConfig, ProjectConditionConfig, UtilProps, UtilThis } from '../index.js';
declare const type = "$not";
export declare type ConditionNot = {
    /**
     * The condition required for this to succeed. You can use the "semanticTitle" to automatically apply thses ccondition
     */
    type: typeof type;
    condition: PrConditionConfig | IssueConditionConfig | ProjectConditionConfig;
};
/** Allows conditions to be combined to create more advanced conditions. Requires the following conditions to fail to return true.
@examples require(".").example
```json
{
    "type": "$not",
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
declare function not(this: UtilThis, condition: ConditionNot, context: UtilProps): Promise<boolean>;
declare const _default: readonly ["$not", typeof not];
export default _default;
export declare const example: ConditionNot;
