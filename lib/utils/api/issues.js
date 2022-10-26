"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: issues.ts
 * Path: \src\utils\api\issues.ts
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
/* eslint-disable @typescript-eslint/naming-convention */
Object.defineProperty(exports, "__esModule", { value: true });
exports.comments = exports.list = exports.get = exports.create = void 0;
// eslint-disable-next-line max-params
async function create(title, body, labels, assignees, milestone, ref) {
    const result = await this.client.rest.issues.create({
        ...this.repo,
        ref: ref ?? this.ref ?? 'master',
        title,
        body,
        milestone,
        labels,
        assignees,
    });
    return result.data;
}
exports.create = create;
async function get(IDNumber, ref) {
    const result = await this.client.rest.issues.get({
        ...this.repo,
        ref: ref ?? this.ref ?? 'master',
        issue_number: IDNumber,
    });
    return result.data;
}
exports.get = get;
async function list({ state, sort, direction, page, ref, }) {
    const result = await this.client.rest.issues.listForRepo({
        ...this.repo,
        ref: ref ?? this.ref ?? 'master',
        state,
        sort,
        direction,
        page,
        per_page: 100,
    });
    return result.data;
}
exports.list = list;
exports.comments = {
    async list(IDNumber, ref) {
        const result = await this.client.rest.issues.listComments({
            ...this.repo,
            ref: ref ?? this.ref ?? 'master',
            issue_number: IDNumber,
        });
        return result.data;
    },
    async get(comment_id, ref) {
        const result = await this.client.rest.issues.getComment({
            ...this.repo,
            ref: ref ?? this.ref ?? 'master',
            comment_id,
        });
        return result.data;
    },
    async create(IDNumber, body, ref) {
        const result = await this.client.rest.issues.createComment({
            ...this.repo,
            ref: ref ?? this.ref ?? 'master',
            issue_number: IDNumber,
            body,
        });
        return result.data;
    },
    async update(comment_id, body, ref) {
        const result = await this.client.rest.issues.updateComment({
            ...this.repo,
            ref: ref ?? this.ref ?? 'master',
            comment_id,
            body,
        });
        return result.data;
    },
    async delete(comment_id, ref) {
        const result = await this.client.rest.issues.deleteComment({
            ...this.repo,
            ref: ref ?? this.ref ?? 'master',
            comment_id,
        });
        return result.data;
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNzdWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWxzL2FwaS9pc3N1ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNDRztBQUNILHlEQUF5RDs7O0FBSXpELHNDQUFzQztBQUMvQixLQUFLLFVBQVUsTUFBTSxDQUUzQixLQUFhLEVBQ2IsSUFBWSxFQUNaLE1BQWdCLEVBQ2hCLFNBQW1CLEVBQ25CLFNBQWlCLEVBQ2pCLEdBQVk7SUFFWixNQUFNLE1BQU0sR0FDUixNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDdEMsR0FBRyxJQUFJLENBQUMsSUFBSTtRQUNaLEdBQUcsRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxRQUFRO1FBQ2hDLEtBQUs7UUFDTCxJQUFJO1FBQ0osU0FBUztRQUNULE1BQU07UUFDTixTQUFTO0tBQ1QsQ0FBQyxDQUFDO0lBQ0wsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ3BCLENBQUM7QUFwQkQsd0JBb0JDO0FBRU0sS0FBSyxVQUFVLEdBQUcsQ0FBYyxRQUFnQixFQUFFLEdBQVk7SUFDcEUsTUFBTSxNQUFNLEdBQ1QsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDO1FBQ25DLEdBQUcsSUFBSSxDQUFDLElBQUk7UUFDWixHQUFHLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUTtRQUNoQyxZQUFZLEVBQUUsUUFBUTtLQUN0QixDQUFDLENBQUM7SUFDSixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDcEIsQ0FBQztBQVJELGtCQVFDO0FBRU0sS0FBSyxVQUFVLElBQUksQ0FFekIsRUFDQyxLQUFLLEVBQ0wsSUFBSSxFQUNKLFNBQVMsRUFDVCxJQUFJ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