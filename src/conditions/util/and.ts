/** @format */

import {
	IssueConditionConfig,
	PRConditionConfig,
	ProjectConditionConfig,
	UtilProps,
	UtilThis
} from "../"
import { evaluator } from "../../evaluator"
const TYPE = "$and"

export interface ConditionAnd {
	type: typeof TYPE
	condition: [PRConditionConfig | IssueConditionConfig | ProjectConditionConfig]
}

/** 
Allows conditions to be combined to create more advanced conditions. Requires all conditions to return true otherwise it would fail.

```json
{
	"type": "$and",
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

function and(this: UtilThis, condition: ConditionAnd, props: UtilProps) {
	let success = 0
	condition.condition.forEach(async (condition) => {
		if (await evaluator.call(this, condition, props)) success++
	})

	return success == condition.condition.length
}

export default [TYPE, and] as const
