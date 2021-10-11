/** @format */

import { UtilProps, UtilThis } from "../"

const TYPE = "descriptionMatches"

export interface ConditionDescriptionMatches {
	type: typeof TYPE
	pattern: string
}

async function descriptionMatches(
	this: UtilThis,
	condition: ConditionDescriptionMatches,
	issue: UtilProps
) {
	const pattern = await this.util.parsingData.processRegExpPattern(
		condition.pattern
	)
	return pattern.test(issue.description)
}

export default [TYPE, descriptionMatches] as const
