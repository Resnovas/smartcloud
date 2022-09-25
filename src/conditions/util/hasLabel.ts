/** @format */

import { UtilProps, UtilThis } from "../"

const TYPE = "hasLabel"

export interface ConditionHasLabel {
	type: typeof TYPE
	label: string
	condition: boolean
}

/** Checks if an issue or pull request has a specific label applied.

Example:

```json
{
	"type": "hasLabel",
	"label": "Type - Bug",
	"condition": "false"
}
```
 */

function hasLabel(
	this: UtilThis,
	condition: ConditionHasLabel,
	issue: UtilProps
) {
	return (
		Boolean(issue.labels?.[condition.label.toLowerCase()]) ==
		condition.condition
	)
}

export default [TYPE, hasLabel] as const
