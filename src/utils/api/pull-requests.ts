/**
 * Project: @resnovas/smartcloud
 * File: pull-requests.ts
 * Path: \src\utils\api\pull-requests.ts
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

/* eslint-disable @typescript-eslint/naming-convention */

import type {Event, Utils} from '..';
import type {Reviews} from '../../conditions';

export async function list(this: Utils, IDNumber: number) {
	const files = await this.client.rest.pulls.listFiles({
		...this.repo,
		pull_number: IDNumber,
		per_page: 100,
	});
	return files.data.map(file => file.filename);
}

export async function changes(Additions: number, deletions: number) {
	return Additions + deletions;
}

export const reviews = {
	async create(
		this: Utils,
		IDNumber: number,
		{
			body,
			event,
			comments,
		}: {
			body?: string;
			event?: Event;
			comments?: Array<{
				path: string;
				position?: number | undefined;
				body: string;
				line?: number | undefined;
				side?: string | undefined;
				start_line?: number | undefined;
				start_side?: string | undefined;
			}>;
		},
	) {
		if (this.dryRun) {
			return;
		}

		const result = await this.client.rest.pulls.createReview({
			...this.repo,
			pull_number: IDNumber,
			body,
			event,
			comments,
		});
		return result.data;
	},
	async requestReviewers(this: Utils, IDNumber: number, reviewers: string[]) {
		if (this.dryRun) {
			return;
		}

		const result = await this.client.rest.pulls.requestReviewers({
			...this.repo,
			pull_number: IDNumber,
			reviewers,
		});
		return result.data;
	},
	async update(this: Utils, IDNumber: number, review_id: number, body: string) {
		if (this.dryRun) {
			return;
		}

		const result = await this.client.rest.pulls.updateReview({
			...this.repo,
			pull_number: IDNumber,
			review_id,
			body,
		});
		return result.data;
	},
	async dismiss(
		this: Utils,
		IDNumber: number,
		review_id: number,
		message: string,
	) {
		if (this.dryRun) {
			return;
		}

		const result = await this.client.rest.pulls.dismissReview({
			...this.repo,
			pull_number: IDNumber,
			review_id,
			message,
		});
		return result.data;
	},

	async list(this: Utils, IDNumber: number) {
		const reviews = await this.client.rest.pulls.listReviews({
			...this.repo,
			pull_number: IDNumber,
			per_page: 100,
		});
		return reviews.data;
	},

	async pending(reviews: number, requested_reviews: number) {
		return reviews < requested_reviews;
	},

	async requestedChanges(reviews: Reviews) {
		let changes = 0;
		for (const review of reviews) {
			if (review.state === 'CHANGES_REQUESTED') {
				changes++;
			}
		}

		return changes;
	},

	async isApproved(reviews: Reviews) {
		let approved = 0;
		for (const review of reviews) {
			if (review.state === 'APPROVED') {
				approved++;
			}
		}

		return approved;
	},
};
