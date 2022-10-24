/*
 * Project: @resnovas/smartcloud
 * File: title-matches.ts
 * Path: \src\conditions\util\title-matches.ts
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
 * Last Modified: 25-10-2022
 * By: Jonathan Stevens (Email: jonathan@resnovas.com, Github: https://github.com/TGTGamer)
 * Current Version: 1.0.0-beta.0
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */

import type {UtilProps, UtilThis} from '../index.js';

const type = 'titleMatches';

export type ConditionTitleMatches = {
	type: typeof type;
	condition: string;
};

/** Checks if an issue or pull request's title matches a Regex condition.
@examples require(".").example
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
	context: UtilProps,
) {
	let test;
	if ('title' in context) {
		test = context.title;
	} else if ('issue' in context && 'title' in context.issue) {
		test = context.issue.title;
	} else if ('pull_request' in context && 'title' in context.pull_request) {
		test = context.pull_request.title;
	}

	if (!test) {
		return false;
	}

	const condition = await this.util.parsingData.processRegExpcondition(
		pattern.condition,
	);

	return condition.test(test);
}

export default [type, titleMatches] as const;
export const example: ConditionTitleMatches = {type, condition: '^foo'};
