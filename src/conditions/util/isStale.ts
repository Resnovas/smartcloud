/** @format */

import { UtilProps, UtilThis } from ".."

const TYPE = "isStale"

export interface ConditionIsStale {
	type: typeof TYPE
	condition: number
}

/** Checks if an issue or pull request is stale.

Example:

```json
{
	"type": "isStale",
	"condition": 30
}
``` */

function isStale(
	this: UtilThis,
	condition: ConditionIsStale,
	issue: UtilProps
) {
	if (!issue.lastUpdated) return false
	const last = new Date(issue.lastUpdated)
	last.setDate(last.getDate() + condition.condition)
	const now = new Date()
	return last >= now
}

export default [TYPE, isStale] as const
