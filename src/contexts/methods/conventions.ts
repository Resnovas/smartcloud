/**
 * Project: @resnovas/smartcloud
 * File: conventions.ts
 * Path: \src\contexts\methods\conventions.ts
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

import * as core from '@actions/core';
import {LoggingLevels} from '@resnovas/utilities';
import type {Issues, Project, PullRequests} from '..';
import {log} from '../../logging';
import type {Condition, SharedConventionConditions} from '../../conditions';
import {evaluator} from '../../evaluator';
import {semantic} from '../../utils/helper/semantic';

/**
 * The enforce conventions configuration
 */

export type Column = string | number;
export type EnforceConventions = {
	/**
	 * The columns to enforce conventions
	 */
	onColumn?: Column[];
	/**
	 * The comment to append to the header
	 */
	commentHeader?: string;
	/**
	 * The comment to append to the footer
	 */
	commentFooter?: string;
	/**
	 * The column to move if fails
	 */
	moveToColumn?: string;
	/**
	 * The conventions to enforce
	 */
	condition: SharedConventionsConfig[];
};

export type SharedConventionsConfig = {
	/**
	 * The failed comment to use
	 */
	failedComment: string;
	/**
	 * The contexts to use. Use this in combernation with "semanticTitle"
	 * @requires conditions: "semanticTitle"
	 */
	contexts?: string[];
} & SharedConventionConditions;

export async function enforce(this: Issues | PullRequests | Project) {
	if (
		!this.config.enforceConventions
		|| !this.config.enforceConventions.condition
	) {
		throw new Error('No enforceable conventions');
	}

	let required = 0;
	let successful = 0;
	const failedMessages: string[] = [];
	// This.config.enforceConventions.conventions.forEach(async (convention) => {
	for (const convention of this.config.enforceConventions.condition) {
		if (!convention.condition) {
			return;
		}

		required++;
		if (convention.condition === 'semanticTitle') {
			convention.requires = 1;
			const conditions: Condition[] = [];
			for (const condition of semantic) {
				conditions.push({
					type: 'titleMatches',
					condition: `/^${condition}(\\(.*\\))?:/i`,
				});
			}

			if (convention.contexts) {
				convention.requires = 2;
				for (const condition of convention.contexts) {
					conditions.push({
						type: 'titleMatches',
						condition: `/\\(.*${condition}.*\\):/i`,
					});
				}
			}

			convention.failedComment
				= `Semantic Conditions failed - Please title your ${this.curContext.type === 'pr' ? 'pull request' : 'issue'
				} using one of the valid options:\r\n\r\n Types: `
				+ semantic.join(', ')
				+ (convention.contexts
					? `\r\n\r\n Contexts: ${convention.contexts.join(', ')}`
					: '');
			convention.condition = conditions;
		}

		const success = await evaluator.call(this, convention, this.context.props);
		if (success) {
			successful++;
		} else {
			failedMessages.push(convention.failedComment);
			log(LoggingLevels.info, convention.failedComment);
		}
	}

	if (required > successful) {
		for (const fail of failedMessages) {
			core.setFailed(fail);
		}

		const suffix = `\r\n\r\n----------\r\n\r\nThis message will be automatically updated when you make this change\r\n\r\n${this.config.enforceConventions.commentFooter || ''
		}`;
		const body: string
			= `${this.config.enforceConventions.commentHeader || ''}\r\n\r\n`
			+ failedMessages?.join('\r\n\r\n')
			+ suffix;
		this.createComment.call(this, 'Conventions', false, {body});
		return false;
	}

	log(
		LoggingLevels.info,
		'All conventions successfully enforced. Moving to next step',
	);
	this.createComment.call(this, 'Conventions', true, {
		body: 'All conventions successfully enforced.',
	});
	return true;
}
