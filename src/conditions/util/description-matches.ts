/**
 * Project: @resnovas/smartcloud
 * File: descriptionMatches.ts
 * Path: \src\conditions\util\descriptionMatches.ts
 * Created Date: Monday, September 5th 2022
 * Author: Jonathan Stevens
 * -----
 * Last Modified: Sun Sep 25 2022
 * Modified By: Jonathan Stevens
 * Current Version: 1.0.0-beta.0
 * -----
 * Copyright (c) 2022 Resnovas - All Rights Reserved
 * -----
 * LICENSE: GNU General Public License v3.0 or later (GPL-3.0+)
 *
 * This program has been provided under confidence of the copyright holder and is
 * licensed for copying, distribution and modification under the terms of
 * the GNU General Public License v3.0 or later (GPL-3.0+) published as the License,
 * or (at your option) any later version of this license.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License v3.0 or later for more details.
 *
 * You should have received a copy of the GNU General Public License v3.0 or later
 * along with this program. If not, please write to: jonathan@resnovas.com ,
 * or see https://www.gnu.org/licenses/gpl-3.0-standalone.html
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE - PLEASE SEE THE LICENSE FILE FOR DETAILS
 * -----
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */

import type {IssueProps, PrProps, ProjectProps, UtilThis} from '..';

const type = 'descriptionMatches';

export type ConditionDescriptionMatches = {
	type: typeof type;
	condition: string;
};

/** Checks if an issue or pull request's description matches a Regex condition.
@examples require(".").example
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
	context: IssueProps | PrProps | ProjectProps,
) {
	const condition = await this.util.parsingData.processRegExpcondition(
		pattern.condition,
	);

	let test;
	switch (context.type) {
		case 'issue':
			test = context.issue.body;
			break;
		case 'pr':
			test = context.pull_request.body;
			break;
		default:
			break;
	}

	if (!test) {
		return false;
	}

	return condition.test(test);
}

export default [type, descriptionMatches] as const;
export const example: ConditionDescriptionMatches = {type, condition: 'foo.*bar'};
