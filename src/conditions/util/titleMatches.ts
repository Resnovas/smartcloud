/** @format */

import { UtilProps, UtilThis } from "../"

const TYPE = "titleMatches"

export interface ConditionTitleMatches {
	type: typeof TYPE
	condition: string
}

/** Checks if an issue or pull request's title matches a Regex condition.

Example:

```json
{
	"type": "titleMatches",
	"condition": "^foo"
}
```
 */

async function titleMatches(
	this: UtilThis,
	pattern: ConditionTitleMatches,
	issue: UtilProps
) {
	const condition = await this.util.parsingData.processRegExpcondition(
		pattern.condition
	)
	return condition.test(issue.title)
}

export default [TYPE, titleMatches] as const
