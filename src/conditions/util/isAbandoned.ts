/** @format */

import { UtilProps, UtilThis } from ".."

const TYPE = "isAbandoned"

export interface ConditionIsAbandoned {
	type: typeof TYPE
	condition: number
	label: string
}

/** Checks if an issue or pull request is abandoned.

Example:

```json
{
	"type": "isAbandoned",
	"condition": 30
}
``` */

function isAbandoned(
	this: UtilThis,
	condition: ConditionIsAbandoned,
	issue: UtilProps
) {
	if (!issue.lastUpdated || !issue.labels?.[condition.label.toLowerCase()])
		return false
	const last = new Date(issue.lastUpdated)
	last.setDate(last.getDate() + condition.condition)
	const now = new Date()
	return last >= now
}

export default [TYPE, isAbandoned] as const
