/**
 * Project: @resnovas/smartcloud
 * File: evaluator.ts
 * Path: \src\evaluator.ts
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

import {LoggingDataClass, LoggingLevels} from '@resnovas/utilities';
import {log} from './logging';

import type {
	IssueConditionConfig,
	PrConditionConfig,
	ProjectConditionConfig,
	UtilProps,
	UtilThis,
} from './conditions';

import type {Issues, Project, PullRequests} from './contexts';
import type {SharedConventionsConfig} from './contexts/methods/conventions';
import type {IssueCondition} from './conditions/issue';
import {getIssueConditionHandler} from './conditions/issue';
import type {PrCondition} from './conditions/pr';
import {getPrConditionHandler} from './conditions/pr';
import type {ProjectCondition} from './conditions/project';
import {getProjectConditionHandler} from './conditions/project';

const forConditions = async <
	T extends IssueCondition | PrCondition | ProjectCondition,
>(
	conditions: T[],
	callback: (condition: T) => boolean,
) => {
	let matches = 0;
	for (const condition of conditions) {
		const callbackResponse = callback(condition);
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
	await log(LoggingLevels.debug, JSON.stringify(config));
	if (typeof condition === 'string') {
		throw new LoggingDataClass(
			LoggingLevels.error,
			'String can not be used to evaluate conditions',
		);
	}

	// @ts-expect-error - still not sure how to resolve this
	const matches = await forConditions(condition, async condition => {
		let handler;
		switch (props.type) {
			case 'issue':
				handler = getIssueConditionHandler.call(
					this as Issues,
					condition as IssueCondition,
				);
				break;
			case 'pr':
				getPrConditionHandler.call(this as PullRequests, condition);
				break;
			case 'project':
				getProjectConditionHandler.call(this as Project, condition);
				break;
			default:
				throw new LoggingDataClass(
					LoggingLevels.error,
					'Invalid type provided to evaluator',
				);
		}

		await log(LoggingLevels.debug, `The handler is ${handler.name}`);

		return handler?.call(this, condition as any, props as any) as boolean;
	});
	await log(LoggingLevels.debug, `Matches: ${matches}/${requires}`);
	return matches >= requires;
}
