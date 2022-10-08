/**
 * Project: @resnovas/smartcloud
 * File: respond.ts
 * Path: \src\utils\respond.ts
 * Created Date: Tuesday, September 6th 2022
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

import type {UtilThis} from '../conditions';
import type {Event} from '.';

export async function respond(
	this: UtilThis,
	success: boolean,
	event: Event = 'REQUEST_CHANGES',
	{
		previousComment,
		body,
	}: {
		previousComment?: number;
		body?: string;
	},
) {
	if (!this.curContext.context.props?.ID) {
		throw new Error('ID value is required');
	}

	if (!previousComment && success && event !== 'APPROVE') {
		return;
	}

	// No need to comment if there is no previous comment and the job is successful
	if ((!previousComment && !success) || event === 'APPROVE') {
		// Does not have a previous comment || is not successful

		if (this.curContext.type === 'pr') {
			await this.util.api.pullRequests.reviews.create(
				this.curContext.context.props.ID,
				body,
				event,
			);
		} else {
			await this.util.api.issues.comments.create(
				this.curContext.context.props.ID,
				body!,
			);
		}
	} else if (previousComment && !success) {
		// Has a previous comment & is not successful

		if (this.curContext.type === 'pr') {
			await this.util.api.pullRequests.reviews.update(
				this.curContext.context.props.ID,
				previousComment,
				body!,
			);
		} else {
			await this.util.api.issues.comments.update(previousComment, body!);
		}
	} else if (previousComment && success) {
		// Has a previous comment & is successful
		if (this.curContext.type === 'pr') {
			await this.util.api.pullRequests.reviews.dismiss(
				this.curContext.context.props.ID,
				previousComment,
				body!,
			);
		} else {
			await this.util.api.issues.comments.delete(previousComment);
		}
	}
}
