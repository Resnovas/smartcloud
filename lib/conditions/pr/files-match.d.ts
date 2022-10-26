import type { Issues, Project, PullRequests } from '../../contexts/index.js';
import type { PrProps } from '../index.js';
declare const type = "filesMatch";
export declare type ConditionFilesMatch = {
    type: typeof type;
    condition: string;
};
/** Checks if the files modified in the pull request match a glob.

Globs are matched using the [minimatch](https://github.com/isaacs/minimatch) library.

Example:

```json
{
    "type": "filesMatch",
    "condition": "src/foo/**"
}
```

@examples require(".").example
*/
declare function filesMatch(this: Issues | PullRequests | Project, condition: ConditionFilesMatch, context: PrProps): boolean;
declare const _default: readonly ["filesMatch", typeof filesMatch];
export default _default;
export declare const example: ConditionFilesMatch;
