/** @format */

import { UtilProps, UtilThis } from "../"

const TYPE = "titleMatches"

export interface ConditionTitleMatches {
	type: typeof TYPE
	pattern: string
}

async function titleMatches(
	this: UtilThis,
	condition: ConditionTitleMatches,
	issue: UtilProps
) {
	const pattern = await this.util.parsingData.processRegExpPattern(
		condition.pattern
	)
	return pattern.test(issue.title)
}

export default [TYPE, titleMatches] as const
