/** @format */

import { UtilProps, UtilThis } from "../"

const TYPE = "creatorMatches"

export interface ConditionCreatorMatches {
	type: typeof TYPE
	condition: string
}

/** Checks if an issue or pull request's creator's username matches a Regex condition.

Example:

```json
{
	"type": "creatorMatches",
	"condition": "^foo"
}
```
 */

async function creatorMatches(
	this: UtilThis,
	pattern: ConditionCreatorMatches,
	issue: UtilProps
) {
	const condition = await this.util.parsingData.processRegExpcondition(
		pattern.condition
	)
	return condition.test(issue.creator)
}

export default [TYPE, creatorMatches] as const
