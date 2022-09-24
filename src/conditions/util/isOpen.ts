/** @format */

import { UtilProps, UtilThis } from "../"

const TYPE = "isOpen"

enum States {
	Open = "OPEN",
	Closed = "CLOSED"
}

export interface ConditionIsOpen {
	type: typeof TYPE
	condition: boolean
}

/** Checks if an issue or pull request is open or closed.

Example:

```json
{
	"type": "isOpen",
	"condition": true
}
``` */

function isOpen(this: UtilThis, condition: ConditionIsOpen, issue: UtilProps) {
	return (
		this.util.parsingData.normalize(issue.state) ===
		this.util.parsingData.normalize(
			condition.condition ? States.Open : States.Closed
		)
	)
}

export default [TYPE, isOpen] as const
