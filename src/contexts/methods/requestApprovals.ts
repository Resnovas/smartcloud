/**
 * Project: @resnovas/smartcloud
 * File: requestApprovals.ts
 * Path: \src\contexts\methods\requestApprovals.ts
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

import * as core from '@actions/core';
import {LoggingDataClass, LoggingLevels} from '@resnovas/utilities';
import type {PullRequests} from '..';
import {log} from '../../logging';
import {evaluator} from '../../evaluator';
import type {SharedConventionsConfig} from '.';

export type RequestApprovals = Record<string, Group>;

type Group = {
	/**
	 * The reviewers to reques
	 */
	reviewers: string[];
	/**
	 * The comment to create
	 */
	comment?: {
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
	};
	condition: SharedConventionsConfig[];
};

export async function requestApprovals(this: PullRequests) {
	log(LoggingLevels.info, 'Starting to Request Approval');
	const requestApprovals = this.config?.requestApprovals;
	if (!requestApprovals) {
		throw new LoggingDataClass(
			LoggingLevels.error,
			'Not Able to automatically request approval',
		);
	}

	for (const group in requestApprovals) {
		const groupConfig = requestApprovals[group];
		if (!groupConfig || !groupConfig.condition || !groupConfig.reviewers) {
			throw new LoggingDataClass(
				LoggingLevels.error,
				'Not Able to automatically request approval for group ' + group,
			);
		}

		groupConfig.condition.forEach(async convention => {
			if (!convention) {
				return;
			}

			if (await evaluator.call(this, convention, this.context.props)) {
				log(LoggingLevels.info, 'Automatically Requesting Approvers');
				const body
					= (groupConfig?.comment?.commentHeader === undefined
						? ''
						: groupConfig?.comment?.commentHeader + '\n\n')
					+ (groupConfig?.comment?.commentBody === undefined
						? 'Automatically Requesting Approvers - Will automatically merge once approved! \n\n'
						: groupConfig?.comment?.commentBody + '\n\n')
					+ (groupConfig?.comment?.commentFooter === undefined
						? ''
						: groupConfig?.comment?.commentFooter);
				await this.util.api.pullRequests.reviews
					.requestReviewers(this.context.props.ID, groupConfig.reviewers)
					.catch(error => {
						log(
							LoggingLevels.error,
							'Unable to automatically request approval',
							error,
						);
					});
				return this.createComment
					.call(this, 'Approvals', false, {event: 'COMMENT', body})
					.catch(error => {
						log(
							LoggingLevels.error,
							'Unable to automatically request approval',
							error,
						);
					});
			}

			core.setFailed(convention.failedComment);
			return false;
		});
		return;
	}
}
