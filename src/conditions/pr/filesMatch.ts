/** @format */

import { match } from "minimatch"
import { PRProps } from "."
import { Issues, Project, PullRequests } from "../../contexts"

const TYPE = "filesMatch"

export interface ConditionFilesMatch {
	type: typeof TYPE
	condition: string
}

/** Checks if the files modified in the pull request match a glob.

Globs are matched using the [minimatch](https://github.com/isaacs/minimatch) library.

Example:

```json
{
	"type": "filesMatch",
	"condition": "src/foo/**"
}
``` */

function filesMatch(
	this: Issues | PullRequests | Project,
	condition: ConditionFilesMatch,
	pr: PRProps
) {
	return match(pr.files, condition.condition).length > 0
}

export default [TYPE, filesMatch] as const
