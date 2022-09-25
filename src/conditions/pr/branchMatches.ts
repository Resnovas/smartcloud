/** @format */

import { PRProps } from "."
import { Issues, Project, PullRequests } from "../../contexts"

const TYPE = "branchMatches"

export interface ConditionBranchMatches {
	type: typeof TYPE
	condition: string
}

/** Checks if branch name matches a Regex condition.

	Example:

```json
{
	"type": "branchMatches",
	"condition": "^bugfix\\/"
}
``` */
async function branchMatches(
	this: Issues | PullRequests | Project,
	pattern: ConditionBranchMatches,
	pr: PRProps
) {
	const condition = await this.util.parsingData.processRegExpcondition(
		pattern.condition
	)
	return condition.test(pr.branch)
}

export default [TYPE, branchMatches] as const
