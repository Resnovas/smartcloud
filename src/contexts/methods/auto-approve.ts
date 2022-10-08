/**
 * Project: @resnovas/smartcloud
 * File: autoApprove.ts
 * Path: \src\contexts\methods\autoApprove.ts
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
import {LoggingDataClass, LoggingLevels} from '@resnovas/utilities';
import type {PullRequests} from '..';
import {log} from '../../logging';
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
		throw new LoggingDataClass(
			LoggingLevels.error,
			'Not Able to automatically approve',
		);
	}

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
				+ (automaticApprove.commentFooter === undefined
					? ''
					: automaticApprove.commentFooter);
			return this.createComment
				.call(this, 'Automatic Approval', false, {event: 'APPROVE', body})
				.catch(error => {
					log(LoggingLevels.error, 'Unable to automatically approving', error);
				});
		}

		core.setFailed(convention.failedComment);
		return false;
	});
}
