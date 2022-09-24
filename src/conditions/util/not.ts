/** @format */

import {
	IssueConditionConfig,
	PRConditionConfig,
	ProjectConditionConfig,
	UtilProps,
	UtilThis
} from ".."
import { evaluator } from "../../evaluator"
const TYPE = "$not"

export interface ConditionNot {
	/**
	 * The number of requires needed for this to succeed
	 */
	requires: number
	/**
	 * The condition required for this to succeed. You can use the "semanticTitle" to automatically apply thses ccondition
	 */
	type: typeof TYPE
	condition: [PRConditionConfig | IssueConditionConfig | ProjectConditionConfig]
}

/** Allows conditions to be combined to create more advanced conditions. Requires the following conditions to fail to return true.

```json
{
	"type": "$not",
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

function not(this: UtilThis, condition: ConditionNot, props: UtilProps) {
	let success = 0
	condition.condition.forEach(async (condition) => {
		if (await evaluator.call(this, condition, props)) success++
	})

	return !(success >= condition.requires)
}

export default [TYPE, not] as const
