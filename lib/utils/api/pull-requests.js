/*
 * Project: @resnovas/smartcloud
 * File: pull-requests.ts
 * Path: \src\utils\api\pull-requests.ts
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
export async function list(IDNumber) {
    const files = await this.client.rest.pulls.listFiles({
        ...this.repo,
        pull_number: IDNumber,
        per_page: 100,
    });
    return files.data.map(file => file.filename);
}
export async function changes(Additions, deletions) {
    return Additions + deletions;
}
export const reviews = {
    async create(IDNumber, { body, event, comments, }) {
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
    async requestReviewers(IDNumber, reviewers) {
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
    async update(IDNumber, review_id, body) {
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
    async dismiss(IDNumber, review_id, message) {
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
    async list(IDNumber) {
        const reviews = await this.client.rest.pulls.listReviews({
            ...this.repo,
            pull_number: IDNumber,
            per_page: 100,
        });
        return reviews.data;
    },
    async pending(reviews, requested_reviews) {
        return reviews < requested_reviews;
    },
    async requestedChanges(reviews) {
        let changes = 0;
        for (const review of reviews) {
            if (review.state === 'CHANGES_REQUESTED') {
                changes++;
            }
        }
        return changes;
    },
    async isApproved(reviews) {
        let approved = 0;
        for (const review of reviews) {
            if (review.state === 'APPROVED') {
                approved++;
            }
        }
        return approved;
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC1yZXF1ZXN0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9hcGkvcHVsbC1yZXF1ZXN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQ0c7QUFPSCxNQUFNLENBQUMsS0FBSyxVQUFVLElBQUksQ0FBYyxRQUFnQjtJQUN2RCxNQUFNLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDcEQsR0FBRyxJQUFJLENBQUMsSUFBSTtRQUNaLFdBQVcsRUFBRSxRQUFRO1FBQ3JCLFFBQVEsRUFBRSxHQUFHO0tBQ2IsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM5QyxDQUFDO0FBRUQsTUFBTSxDQUFDLEtBQUssVUFBVSxPQUFPLENBQUMsU0FBaUIsRUFBRSxTQUFpQjtJQUNqRSxPQUFPLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDOUIsQ0FBQztBQUVELE1BQU0sQ0FBQyxNQUFNLE9BQU8sR0FBRztJQUN0QixLQUFLLENBQUMsTUFBTSxDQUVYLFFBQWdCLEVBQ2hCLEVBQ0MsSUFBSSxFQUNKLEtBQUssRUFDTCxRQUFRLEdBYVI7UUFFRCxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDaEIsT0FBTztTQUNQO1FBRUQsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDO1lBQ3hELEdBQUcsSUFBSSxDQUFDLElBQUk7WUFDWixXQUFXLEVBQUUsUUFBUTtZQUNyQixJQUFJO1lBQ0osS0FBSztZQUNMLFFBQVE7U0FDUixDQUFDLENBQUM7UUFDSCxPQUFPLE1BQU0s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