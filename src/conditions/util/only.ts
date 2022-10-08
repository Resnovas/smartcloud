/**
 * Project: @resnovas/smartcloud
 * File: only.ts
 * Path: \src\conditions\util\only.ts
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

import type {
	IssueConditionConfig,
	PrConditionConfig,
	ProjectConditionConfig,
	UtilProps,
	UtilThis,
} from '..';
import {evaluator} from '../../evaluator';

const type = '$only';

export type ConditionOnlyOne = {
	required: number;
	type: typeof type;
	condition: Array<PrConditionConfig | IssueConditionConfig | ProjectConditionConfig>;
};

/** Requires only the number specified in `requires` to pass otherwise it fails.
@examples require(".").example
```json
{
	"type": "$only",
	"requires": 1,
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

async function only(this: UtilThis, condition: ConditionOnlyOne, props: UtilProps) {
	const results = await run.call(this, condition, props);
	const success = results.filter(Boolean).length;
	return success === condition.required;
}

export default [type, only] as const;

async function run(this: UtilThis, condition: ConditionOnlyOne, props: UtilProps) {
	const results: Array<Promise<boolean>> = [];

	for (const conditions of condition.condition) {
		results.push(evaluator.call(this, conditions, props));
	}

	return Promise.all(results);
}

export const example: ConditionOnlyOne = {
	type,
	required: 1,
	condition: [
		{
			requires: 1,
			condition: [
				{
					type: 'isLocked',
					condition: true,
				},
			],
		},
		{
			requires: 1,
			condition: [
				{
					type: 'isOpen',
					condition: true,
				},
			],
		},
	],
};
