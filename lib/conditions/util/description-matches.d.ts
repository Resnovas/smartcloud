import type { IssueProps, PrProps, ProjectProps, UtilThis } from '../index.js';
declare const type = "descriptionMatches";
export type ConditionDescriptionMatches = {
    type: typeof type;
    condition: string;
};
/** Checks if an issue or pull request's description matches a Regex condition.
@examples require(".").example
Example:

```json
{
    "type": "descriptionMatches",
    "condition": "foo.*bar"
}
``` */
declare function descriptionMatches(this: UtilThis, pattern: ConditionDescriptionMatches, context: IssueProps | PrProps | ProjectProps): Promise<boolean>;
declare const _default: readonly ["descriptionMatches", typeof descriptionMatches];
export default _default;
export declare const example: ConditionDescriptionMatches;
