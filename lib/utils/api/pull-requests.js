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
const tslib_1 = require("tslib");
function list(IDNumber) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const files = yield this.client.rest.pulls.listFiles(Object.assign(Object.assign({}, this.repo), { pull_number: IDNumber, per_page: 100 }));
        return files.data.map(file => file.filename);
    });
}
exports.list = list;
function changes(Additions, deletions) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return Additions + deletions;
    });
}
exports.changes = changes;
exports.reviews = {
    create(IDNumber, { body, event, comments, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.dryRun) {
                return;
            }
            const result = yield this.client.rest.pulls.createReview(Object.assign(Object.assign({}, this.repo), { pull_number: IDNumber, body,
                event,
                comments }));
            return result.data;
        });
    },
    requestReviewers(IDNumber, reviewers) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.dryRun) {
                return;
            }
            const result = yield this.client.rest.pulls.requestReviewers(Object.assign(Object.assign({}, this.repo), { pull_number: IDNumber, reviewers }));
            return result.data;
        });
    },
    update(IDNumber, review_id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.dryRun) {
                return;
            }
            const result = yield this.client.rest.pulls.updateReview(Object.assign(Object.assign({}, this.repo), { pull_number: IDNumber, review_id,
                body }));
            return result.data;
        });
    },
    dismiss(IDNumber, review_id, message) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.dryRun) {
                return;
            }
            const result = yield this.client.rest.pulls.dismissReview(Object.assign(Object.assign({}, this.repo), { pull_number: IDNumber, review_id,
                message }));
            return result.data;
        });
    },
    list(IDNumber) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const reviews = yield this.client.rest.pulls.listReviews(Object.assign(Object.assign({}, this.repo), { pull_number: IDNumber, per_page: 100 }));
            return reviews.data;
        });
    },
    pending(reviews, requested_reviews) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return reviews < requested_reviews;
        });
    },
    requestedChanges(reviews) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let changes = 0;
            for (const review of reviews) {
                if (review.state === 'CHANGES_REQUESTED') {
                    changes++;
                }
            }
            return changes;
        });
    },
    isApproved(reviews) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let approved = 0;
            for (const review of reviews) {
                if (review.state === 'APPROVED') {
                    approved++;
                }
            }
            return approved;
        });
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC1yZXF1ZXN0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9hcGkvcHVsbC1yZXF1ZXN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHOzs7O0FBT0gsU0FBc0IsSUFBSSxDQUFjLFFBQWdCOztRQUN2RCxNQUFNLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLGlDQUNoRCxJQUFJLENBQUMsSUFBSSxLQUNaLFdBQVcsRUFBRSxRQUFRLEVBQ3JCLFFBQVEsRUFBRSxHQUFHLElBQ1osQ0FBQztRQUNILE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDOUMsQ0FBQztDQUFBO0FBUEQsb0JBT0M7QUFFRCxTQUFzQixPQUFPLENBQUMsU0FBaUIsRUFBRSxTQUFpQjs7UUFDakUsT0FBTyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBQzlCLENBQUM7Q0FBQTtBQUZELDBCQUVDO0FBRVksUUFBQSxPQUFPLEdBQUc7SUFDaEIsTUFBTSxDQUVYLFFBQWdCLEVBQ2hCLEVBQ0MsSUFBSSxFQUNKLEtBQUssRUFDTCxRQUFRLEdBYVI7O1lBRUQsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNoQixPQUFPO2FBQ1A7WUFFRCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLGlDQUNwRCxJQUFJLENBQUMsSUFBSSxLQUNaLFdBQVcsRUFBRSxRQUFRLEVBQ3JCLElBQUk7Z0JBQ0osS0FBSztnQkFDTCxRQUFRLElBQ1AsQ0FBQztZQUNILE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQztRQUNwQixDQUFDO0tBQUE7SUFD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