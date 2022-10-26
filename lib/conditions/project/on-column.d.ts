import type { Issues, Project, PullRequests } from '../../contexts/index.js';
import type { ProjectProps } from './index.js';
declare const type = "onColumn";
export declare type ConditiononColumn = {
    type: typeof type;
    project: string;
    column: string;
};
/** Checks if the card is in the specified column.
@examples require(".").example
Example:

```json
{
    "type": "onColumn",
    "project": "Isuues",
    "column": "New"
}
``` */
declare function onColumn(this: Issues | PullRequests | Project, condition: ConditiononColumn, context: ProjectProps): boolean;
declare const _default: readonly ["onColumn", typeof onColumn];
export default _default;
export declare const example: ConditiononColumn;
