/** @format */

import { PRProps } from "."
import { Issues, Project, PullRequests } from "../../contexts"

const TYPE = "isDraft"

export interface ConditionIsDraft {
	type: typeof TYPE
	condition: boolean
}

/** Checks if a pull request is a draft.

Example:

```json
{
	"type": "isDraft",
	"condition": true
}
``` */
function isDraft(
	this: Issues | PullRequests | Project,
	condition: ConditionIsDraft,
	pr: PRProps
) {
	return pr.isDraft === condition.condition
}

export default [TYPE, isDraft] as const
