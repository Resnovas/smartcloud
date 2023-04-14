/*
 * Project: @resnovas/smartcloud
 * File: evaluator.ts
 * Path: \src\evaluator.ts
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

import {log, LoggingLevels} from './logging.js';
import type {
	IssueConditionConfig,
	PrConditionConfig,
	ProjectConditionConfig,
	UtilProps,
	UtilThis} from './conditions/index.js';
import {
	getConditionHandler,
} from './conditions/index.js';
import type {SharedConventionsConfig} from './contexts/methods/conventions.js';
import type {IssueCondition} from './conditions/issue/index.js';
import type {PrCondition} from './conditions/pr/index.js';
import type {ProjectCondition} from './conditions/project/index.js';

const forConditions = async (
	conditions: Array<IssueCondition | PrCondition | ProjectCondition >,
	callback: (condition: IssueCondition | PrCondition | ProjectCondition) => Promise<boolean>,
) => {
	let matches = 0;
	for (const condition of conditions) {
		// eslint-disable-next-line no-await-in-loop
		const callbackResponse = await callback(condition);
		if (callbackResponse) {
			matches++;
		}
	}

	return matches;
};

export async function evaluator(
	this: UtilThis,
	config:
	| PrConditionConfig
	| IssueConditionConfig
	| ProjectConditionConfig
	| SharedConventionsConfig,
	props: UtilProps,
) {
	const {condition, requires} = config;
	log(LoggingLevels.debug, JSON.stringify(config));
	if (typeof condition === 'string') {
		throw new TypeError(log(
			LoggingLevels.error,
			'String can not be used to evaluate conditions',
		));
	}

	const matches = await forConditions(condition, async condition => {
		const handler = getConditionHandler.call(
			this,
			condition,
		);

		if (!handler) {
			throw new Error(log(
				LoggingLevels.error,
				'Handler must be defined',
			));
		}

		// @ts-expect-error - Todo: need to be fixed, typing issue which never gets triggered in runtime
		const result = await handler?.call(this, condition, props);

		log(LoggingLevels.debug, `The handler is ${handler.name}, Result: ${String(result)}`);
		return result;
	});
	log(LoggingLevels.debug, `Matches: ${matches}/${requires}`);
	return matches >= requires;
}
