import type { Issues, Project, PullRequests } from '../../contexts/index.js';
import type { PrProps } from '../index.js';
declare const type = "changesSize";
export type ConditionChangesSize = {
    type: typeof type;
    min: number;
    max?: number;
};
/** Checks if an pull request's changes against `min` & `max` values. Note: if `max` is `undefined` assumed value is `unlimited`

Example:

```json
{
    "type": "changesSize",
    "min": 0,
    "max": 100
}
```
@examples require(".").example
*/
declare function changesSize(this: Issues | PullRequests | Project, condition: ConditionChangesSize, context: PrProps): boolean;
declare const _default: readonly ["changesSize", typeof changesSize];
export default _default;
export declare const example: ConditionChangesSize;
