/** @format */

import { UtilProps, UtilThis } from "../"

const TYPE = "descriptionMatches"

export interface ConditionDescriptionMatches {
	type: typeof TYPE
	condition: string
}

/** Checks if an issue or pull request's description matches a Regex condition.

Example:

```json
{
	"type": "descriptionMatches",
	"condition": "foo.*bar"
}
``` */

async function descriptionMatches(
	this: UtilThis,
	pattern: ConditionDescriptionMatches,
	issue: UtilProps
) {
	const condition = await this.util.parsingData.processRegExpcondition(
		pattern.condition
	)
	return condition.test(issue.description)
}

export default [TYPE, descriptionMatches] as const
