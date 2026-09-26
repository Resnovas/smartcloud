"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviews = exports.changes = exports.list = void 0;
async function list(IDNumber) {
    const files = await this.client.rest.pulls.listFiles({
        ...this.repo,
        pull_number: IDNumber,
        per_page: 100,
    });
    return files.data.map(file => file.filename);
}
exports.list = list;
async function changes(Additions, deletions) {
    return Additions + deletions;
}
exports.changes = changes;
exports.reviews = {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC1yZXF1ZXN0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9hcGkvcHVsbC1yZXF1ZXN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHOzs7QUFPSSxLQUFLLFVBQVUsSUFBSSxDQUFjLFFBQWdCO0lBQ3ZELE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUNwRCxHQUFHLElBQUksQ0FBQyxJQUFJO1FBQ1osV0FBVyxFQUFFLFFBQVE7UUFDckIsUUFBUSxFQUFFLEdBQUc7S0FDYixDQUFDLENBQUM7SUFDSCxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzlDLENBQUM7QUFQRCxvQkFPQztBQUVNLEtBQUssVUFBVSxPQUFPLENBQUMsU0FBaUIsRUFBRSxTQUFpQjtJQUNqRSxPQUFPLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDOUIsQ0FBQztBQUZELDBCQUVDO0FBRVksUUFBQSxPQUFPLEdBQUc7SUFDdEIsS0FBSyxDQUFDLE1BQU0sQ0FFWCxRQUFnQixFQUNoQixFQUNDLElBQUksRUFDSixLQUFLLEVBQ0wsUUFBUSxHQWFSO1FBRUQsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2hCLE9BQU87U0FDUDtRQUVELE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQztZQUN4RCxHQUFHLElBQUksQ0FBQyxJQUFJO1lBQ1osV0FBVyxFQUFFLFFBQVE7WUFDckIsSUFBSTtZQUNKLEtBQUs7WUFDTCxRQUFRO1NBQ1IsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ3BCLENBQUM7SUFDRCxLQUFLLENBQUMsZ0JBQWdCLENBQWMsUUFBZ0IsRUFBRSxTQUFtQjtRQUN4RSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDaEIsT0FBTztTQUNQO1FBRUQsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUM7WUFDNUQsR0FBRyxJQUFJLENBQUMsSUFBSTtZQUNaLFdBQVcsRUFBRSxRQUFRO1lBQ3JCLFNBQVM7U0FDVCxDQUFDLENBQUM7UUFDSCxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDcEIsQ0FBQztJQUNELEtBQUssQ0FBQyxNQUFNLENBQWMsUUFBZ0IsRUFBRSxTQUFpQixFQUFFLElBQVk7UUFDMUUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2hCLE9BQU87U0FDUDtRQUVELE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQztZQUN4RCxHQUFHLElBQUksQ0FBQyxJQUFJO1lBQ1osV0FBVyxFQUFFLFFBQVE7WUFDckIsU0FBUztZQUNULElBQUk7U0FDSixDQUFDLENBQUM7UUFDSCxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDcEIsQ0FBQztJQUNELEtBQUssQ0FBQyxPQUFPLENBRVosUUFBZ0IsRUFDaEIsU0FBaUIsRUFDakIsT0FBZTtRQUVmLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNoQixPQUFPO1NBQ1A7UUFFRCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUM7WUFDekQsR0FBRyxJQUFJLENBQUMsSUFBSTtZQUNaLFdBQVcsRUFBRSxRQUFRO1lBQ3JCLFNBQVM7WUFDVCxPQUFPO1NBQ1AsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ3BCLENBQUM7SUFFRCxLQUFLLENBQUMsSUFBSSxDQUFjLFFBQWdCO1FBQ3ZDLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQztZQUN4RCxHQUFHLElBQUksQ0FBQyxJQUFJO1lBQ1osV0FBVyxFQUFFLFFBQVE7WUFDckIsUUFBUSxFQUFFLEdBQUc7U0FDYixDQUFDLENBQUM7UUFDSCxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZSxFQUFFLGlCQUF5QjtRQUN2RCxPQUFPLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQztJQUNwQyxDQUFDO0lBRUQsS0FBSyxDQUFDLGdCQUFnQixDQUFDLE9BQWdCO1FBQ3RDLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztRQUNoQixLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRTtZQUM3QixJQUFJLE1BQU0sQ0FBQyxLQUFLLEtBQUssbUJBQW1CLEVBQUU7Z0JBQ3pDLE9BQU8sRUFBRSxDQUFDO2FBQ1Y7U0FDRDtRQUVELE9BQU8sT0FBTyxDQUFDO0lBQ2hCLENBQUM7SUFFRCxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQWdCO1FBQ2hDLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQztRQUNqQixLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRTtZQUM3QixJQUFJLE1BQU0sQ0FBQyxLQUFLLEtBQUssVUFBVSxFQUFFO2dCQUNoQyxRQUFRLEVBQUUsQ0FBQzthQUNYO1NBQ0Q7UUFFRCxPQUFPLFFBQVEsQ0FBQztJQUNqQixDQUFDO0NBQ0QsQ0FBQyJ9