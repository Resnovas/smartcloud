/*
 * Project: @resnovas/smartcloud
 * File: auto-approve.ts
 * Path: \src\contexts\methods\auto-approve.ts
 * Created Date: Monday, September 5th 2022
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

import * as core from '@actions/core';
import {LoggingLevels, log} from '../../logging';
import type {PullRequests} from '..';

import {evaluator} from '../../evaluator';
import type {SharedConventionsConfig} from './conventions';

/**
 * Automatic Approval configuration
 */
export type AutomaticApprove = {
	/**
	 * The comment to append to the header
	 */
	commentHeader?: string;
	/**
	 * The comment to append to the footer
	 */
	commentBody?: string;
	/**
	 * The comment to append to the footer
	 */
	commentFooter?: string;
	/**
	 * The conventions to use when approving
	 */
	condition: SharedConventionsConfig[];
};

export async function automaticApprove(this: PullRequests) {
	log(LoggingLevels.info, 'Starting Automatic Approved');
	const automaticApprove = this.config?.automaticApprove;
	if (!automaticApprove || !automaticApprove.condition) {
		throw new Error(log(
			LoggingLevels.error,
			'Not Able to automatically approve',
		));
	}

	// Todo: change to for loop
	// eslint-disable-next-line unicorn/no-array-for-each
	automaticApprove.condition.forEach(async convention => {
		if (!convention.condition) {
			return;
		}

		if (await evaluator.call(this, convention, this.context.props)) {
			log(LoggingLevels.info, 'Automatically Approved Successfully');

			const body
				= (automaticApprove.commentHeader === undefined
					? ''
					: automaticApprove.commentHeader + '\n\n')
				+ (automaticApprove.commentBody === undefined
					? 'Automatically Approved - Will automatically merge shortly! \n\n'
					: automaticApprove.commentBody + '\n\n')
				+ (automaticApprove.commentFooter ?? '');

			await this.createComment.bind(this)('Automatic Approval', false, {event: 'APPROVE', body})
				.catch(() => {
					throw new Error(log(LoggingLevels.error, 'Unable to automatically approve'));
				});
			return;
		}

		core.setFailed(convention.failedComment);
		return false;
	});
}
