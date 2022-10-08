/**
 * Project: @resnovas/smartcloud
 * File: is-approved.ts
 * Path: \src\conditions\pr\is-approved.ts
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

import type {Issues, Project, PullRequests} from '../../contexts';
import type {PrProps} from '..';

const type = 'isApproved';

export type ConditionisApproved = {
	type: typeof type;
	value: boolean;
	required?: number;
};

/** Checks if a pull request has requested a review.

Example:

```json
{
	"type": "isApproved",
	"value": true,
	"required": 1
}
```
@examples require(".").example
*/

function isApproved(
	this: Issues | PullRequests | Project,
	condition: ConditionisApproved,
	pr: PrProps,
) {
	const reviewers: string[] = [];
	for (const review of pr.reviews) {
		if (!reviewers.includes(review.user.login)) {
			reviewers.push(review.user.login);
		}
	}

	return (
		!pr.pendingReview
		&& pr.approved >= reviewers.length
		&& (condition.required ? pr.approved >= condition.required : true)
	);
}

export default [type, isApproved] as const;
export const example: ConditionisApproved = {
	type,
	value: true,
	required: 1,
};
