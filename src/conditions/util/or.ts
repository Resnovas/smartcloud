/** @format */

import {
	IssueConditionConfig,
	PRConditionConfig,
	ProjectConditionConfig,
	UtilProps,
	UtilThis
} from "../"
import { evaluator } from "../../evaluator"
const TYPE = "$or"

export interface ConditionOr {
	type: typeof TYPE
	condition: [PRConditionConfig | IssueConditionConfig | ProjectConditionConfig]
}

/** Allows conditions to be combined to create more advanced conditions. Would require one conditions to return true otherwise it would fail. If both return true, this would return false.

```json
{
	"type": "$or",
	"condition": [
		{
			"requires": 1,
			"conditions": []
		},
		{
			"requires": 1,
			"conditions": []
		}
	]
}
``` */

function or(this: UtilThis, condition: ConditionOr, props: UtilProps) {
	let success = false

	condition.condition.forEach(async (condition) => {
		if (await evaluator.call(this, condition, props)) success = true
	})

	return success
}

export default [TYPE, or] as const
