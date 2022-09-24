/** @format */

import { UtilProps, UtilThis } from ".."

const TYPE = "isLocked"

export interface ConditionIsLocked {
	type: typeof TYPE
	condition: boolean
}

/** Checks if an issue or pull request is locked.

Example:

```json
{
	"type": "isLocked",
	"condition": true
}
``` */

function isLocked(
	this: UtilThis,
	condition: ConditionIsLocked,
	issue: UtilProps
) {
	return condition.condition == issue.locked
}

export default [TYPE, isLocked] as const
