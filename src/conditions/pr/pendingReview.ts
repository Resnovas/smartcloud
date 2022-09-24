/** @format */

import { PRProps } from "."
import { Issues, Project, PullRequests } from "../../contexts"

const TYPE = "pendingReview"

export interface ConditionPendingReview {
	type: typeof TYPE
	condition: boolean
}

/** Checks if a pull request has requested a review.

Example:

```json
{
	"type": "pendingReview",
	"condition": true
}
``` */

function pendingReview(
	this: Issues | PullRequests | Project,
	condition: ConditionPendingReview,
	pr: PRProps
) {
	return pr.pendingReview === condition.condition
}

export default [TYPE, pendingReview] as const
