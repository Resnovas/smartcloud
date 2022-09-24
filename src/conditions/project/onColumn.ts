/** @format */

import { ProjectProps } from "."
import { Issues, Project, PullRequests } from "../../contexts"

const TYPE = "onColumn"

export interface ConditiononColumn {
	type: typeof TYPE
	project: string
	column: string
}
/** Checks if the card is in the specified column.

Example:

```json
{
	"type": "onColumn",
	"project": "Isuues",
	"column": "New"
}
``` */
function onColumn(
	this: Issues | PullRequests | Project,
	condition: ConditiononColumn,
	pr: ProjectProps
) {
	return (
		pr.localColumn.name == condition.column &&
		pr.project.name == condition.project
	)
}

export default [TYPE, onColumn] as const
