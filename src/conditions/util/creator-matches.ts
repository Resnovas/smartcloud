/**
 * Project: @resnovas/smartcloud
 * File: creator-matches.ts
 * Path: \src\conditions\util\creator-matches.ts
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

import type {UtilProps, UtilThis} from '..';

const type = 'creatorMatches';

export type ConditionCreatorMatches = {
	type: typeof type;
	condition: string;
};

/** Checks if an issue or pull request's creator's username matches a Regex condition.

Example:
@examples require(".").example
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
	issue: UtilProps,
) {
	const condition = await this.util.parsingData.processRegExpcondition(
		pattern.condition,
	);
	return condition.test(issue.creator);
}

export default [type, creatorMatches] as const;
export const example: ConditionCreatorMatches = {
	type,
	condition: '^foo',
};
