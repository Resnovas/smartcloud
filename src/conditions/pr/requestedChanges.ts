/** @format */

import { PRProps } from "."
import { Issues, Project, PullRequests } from "../../contexts"

const TYPE = "requestedChanges"

export interface ConditionRequestedChanges {
	type: typeof TYPE
	condition: boolean
}

/** Checks if a pull request has requested a review.

Example:

```json
{
	"type": "requestedChanges",
	"condition": true
}
``` */

function requestedChanges(
	this: Issues | PullRequests | Project,
	condition: ConditionRequestedChanges,
	pr: PRProps
) {
	return condition.condition === pr.requestedChanges > pr.approved
}

export default [TYPE, requestedChanges] as const
