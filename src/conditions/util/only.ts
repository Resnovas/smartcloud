/** @format */

import {
	IssueConditionConfig,
	PRConditionConfig,
	ProjectConditionConfig,
	UtilProps,
	UtilThis
} from ".."
import { evaluator } from "../../evaluator"

const TYPE = "$only"

export interface ConditionOnlyOne {
	required: number
	type: typeof TYPE
	condition: [PRConditionConfig | IssueConditionConfig | ProjectConditionConfig]
}

/** Requires only the number specified in `requires` to pass otherwise it fails.

```json
{
	"type": "$only",
	"requires": 1,
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

function only(this: UtilThis, condition: ConditionOnlyOne, props: UtilProps) {
	let success = 0

	condition.condition.forEach(async (condition) => {
		if (await evaluator.call(this, condition, props)) success++
	})

	return success == condition.required
}

export default [TYPE, only] as const
