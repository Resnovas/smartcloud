/*
 * Project: @resnovas/smartcloud
 * File: description-matches.ts
 * Path: \src\conditions\util\description-matches.ts
 * Created Date: Saturday, October 8th 2022
 * Author: Jonathan Stevens (Email: jonathan@resnovas.com, Github: https://github.com/TGTGamer)
 * -----
 * Contributing: Please read through our contributing guidelines. Included are directions for opening
 * issues, coding standards, and notes on development. These can be found at https://github.com/resnovas/smartcloud/CONTRIBUTING.md
 *
 * Code of Conduct: This project abides by the Contributor Covenant, version 2.0. Please interact in ways that contribute to an open,
 * welcoming, diverse, inclusive, and healthy community. Our Code of Conduct can be found at https://github.com/resnovas/smartcloud/CODE_OF_CONDUCT.md
 * -----
 * Copyright (c) 2022 Resnovas - All Rights Reserved
 * LICENSE: GNU General Public License v3.0 or later (GPL-3.0+)
 * -----
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
 * along with this program. If not, please write to: jonathan@resnovas.com,
 * or see https://www.gnu.org/licenses/gpl-3.0-standalone.html
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE - PLEASE SEE THE LICENSE FILE FOR DETAILS
 * -----
 * Last Modified: 23-10-2022
 * By: Jonathan Stevens (Email: jonathan@resnovas.com, Github: https://github.com/TGTGamer)
 * Current Version: 1.0.0-beta.0
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */

// import log, {LoggingLevels} from '../../logging.js';
import type {IssueProps, PrProps, ProjectProps, UtilThis} from '../index.js';

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
	if ('body' in context) {
		test = context.body as string;
	} else if ('issue' in context && 'body' in context.issue) {
		test = context.issue.body;
	} else if ('pull_request' in context && 'body' in context.pull_request) {
		test = context.pull_request.body;
	}

	if (!test) {
		return false;
	}

	// Log(LoggingLevels.debug, 'Running Test: ' + pattern.condition + ' on body:' + test + '\nresult: ' + String(condition.test(test)));

	return condition.test(test);
}

export default [type, descriptionMatches] as const;
export const example: ConditionDescriptionMatches = {type, condition: 'foo.*bar'};
