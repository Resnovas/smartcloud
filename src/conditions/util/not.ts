/**
 * Project: @resnovas/smartcloud
 * File: not.ts
 * Path: \src\conditions\util\not.ts
 * Created Date: Sunday, September 25th 2022
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

import type {
	IssueConditionConfig,
	PrConditionConfig,
	ProjectConditionConfig,
	UtilProps,
	UtilThis,
} from '..';

import {evaluator} from '../../evaluator';

const type = '$not';

export type ConditionNot = {
	/**
	 * The condition required for this to succeed. You can use the "semanticTitle" to automatically apply thses ccondition
	 */
	type: typeof type;
	condition: PrConditionConfig | IssueConditionConfig | ProjectConditionConfig;
};

/** Allows conditions to be combined to create more advanced conditions. Requires the following conditions to fail to return true.
@examples require(".").example
```json
{
	"type": "$not",
	"condition": [
		{
			"requires": 1,
			"conditions": []
		},
		{
			"requires": 1,
			"conditions": []
		}
	]
}
``` */

async function not(this: UtilThis, condition: ConditionNot, props: UtilProps) {
	const success = await evaluator.call(this, condition.condition, props);

	return !(success);
}

export default [type, not] as const;

export const example: ConditionNot = {
	type,
	condition:
		{
			requires: 1,
			condition: [
				{
					type: 'isDraft',
					condition: true,
				},
			],
		},
};
