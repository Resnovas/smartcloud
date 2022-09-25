/** @format */

import { PRProps } from "."
import { Issues, Project, PullRequests } from "../../contexts"

const TYPE = "changesSize"

export interface ConditionChangesSize {
	type: typeof TYPE
	min: number
	max?: number
}

/** Checks if an pull request's changes against `min` & `max` values. Note: if `max` is `undefined` assumed value is `unlimited`

Example:

```json
{
	"type": "changesSize",
	"min": 0,
	"max": 100
}
``` */
function changesSize(
	this: Issues | PullRequests | Project,
	condition: ConditionChangesSize,
	pr: PRProps
) {
	if (
		pr.changes >= condition.min &&
		((condition.max && pr.changes < condition.max) || !condition.max)
	) {
		return true
	}
	return false
}

export default [TYPE, changesSize] as const
