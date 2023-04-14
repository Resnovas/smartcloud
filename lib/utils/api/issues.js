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
const tslib_1 = require("tslib");
// eslint-disable-next-line max-params
function create(title, body, labels, assignees, milestone, ref) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const result = yield this.client.rest.issues.create(Object.assign(Object.assign({}, this.repo), { ref: (_a = ref !== null && ref !== void 0 ? ref : this.ref) !== null && _a !== void 0 ? _a : 'master', title,
            body,
            milestone,
            labels,
            assignees }));
        return result.data;
    });
}
exports.create = create;
function get(IDNumber, ref) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const result = yield this.client.rest.issues.get(Object.assign(Object.assign({}, this.repo), { ref: (_a = ref !== null && ref !== void 0 ? ref : this.ref) !== null && _a !== void 0 ? _a : 'master', issue_number: IDNumber }));
        return result.data;
    });
}
exports.get = get;
function list({ state, sort, direction, page, ref, }) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const result = yield this.client.rest.issues.listForRepo(Object.assign(Object.assign({}, this.repo), { ref: (_a = ref !== null && ref !== void 0 ? ref : this.ref) !== null && _a !== void 0 ? _a : 'master', state,
            sort,
            direction,
            page, per_page: 100 }));
        return result.data;
    });
}
exports.list = list;
exports.comments = {
    list(IDNumber, ref) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const result = yield this.client.rest.issues.listComments(Object.assign(Object.assign({}, this.repo), { ref: (_a = ref !== null && ref !== void 0 ? ref : this.ref) !== null && _a !== void 0 ? _a : 'master', issue_number: IDNumber }));
            return result.data;
        });
    },
    get(comment_id, ref) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const result = yield this.client.rest.issues.getComment(Object.assign(Object.assign({}, this.repo), { ref: (_a = ref !== null && ref !== void 0 ? ref : this.ref) !== null && _a !== void 0 ? _a : 'master', comment_id }));
            return result.data;
        });
    },
    create(IDNumber, body, ref) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const result = yield this.client.rest.issues.createComment(Object.assign(Object.assign({}, this.repo), { ref: (_a = ref !== null && ref !== void 0 ? ref : this.ref) !== null && _a !== void 0 ? _a : 'master', issue_number: IDNumber, body }));
            return result.data;
        });
    },
    update(comment_id, body, ref) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const result = yield this.client.rest.issues.updateComment(Object.assign(Object.assign({}, this.repo), { ref: (_a = ref !== null && ref !== void 0 ? ref : this.ref) !== null && _a !== void 0 ? _a : 'master', comment_id,
                body }));
            return result.data;
        });
    },
    delete(comment_id, ref) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const result = yield this.client.rest.issues.deleteComment(Object.assign(Object.assign({}, this.repo), { ref: (_a = ref !== null && ref !== void 0 ? ref : this.ref) !== null && _a !== void 0 ? _a : 'master', comment_id }));
            return result.data;
        });
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNzdWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWxzL2FwaS9pc3N1ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNDRztBQUNILHlEQUF5RDs7OztBQUl6RCxzQ0FBc0M7QUFDdEMsU0FBc0IsTUFBTSxDQUUzQixLQUFhLEVBQ2IsSUFBWSxFQUNaLE1BQWdCLEVBQ2hCLFNBQW1CLEVBQ25CLFNBQWlCLEVBQ2pCLEdBQVk7OztRQUVaLE1BQU0sTUFBTSxHQUNSLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0saUNBQ2xDLElBQUksQ0FBQyxJQUFJLEtBQ1osR0FBRyxFQUFFLE1BQUEsR0FBRyxhQUFILEdBQUcsY0FBSCxHQUFHLEdBQUksSUFBSSxDQUFDLEdBQUcsbUNBQUksUUFBUSxFQUNoQyxLQUFLO1lBQ0wsSUFBSTtZQUNKLFNBQVM7WUFDVCxNQUFNO1lBQ04sU0FBUyxJQUNSLENBQUM7UUFDTCxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUM7O0NBQ25CO0FBcEJELHdCQW9CQztBQUVELFNBQXNCLEdBQUcsQ0FBYyxRQUFnQixFQUFFLEdBQVk7OztRQUNwRSxNQUFNLE1BQU0sR0FDVCxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLGlDQUMvQixJQUFJLENBQUMsSUFBSSxLQUNaLEdBQUcsRUFBRSxNQUFBLEdBQUcsYUFBSCxHQUFHLGNBQUgsR0FBRyxHQUFJLElBQUksQ0FBQyxHQUFHLG1DQUFJLFFBQVEsRUFDaEMsWUFBWSxFQUFFLFFBQVEsSUFDckIsQ0FBQztRQUNKLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQzs7Q0FDbkI7QUFSRCxrQkFRQztBQUVELFNBQXNCLElBQUksQ0FFekIsRUFDQyxLQUFLLEVBQ0wsSUFBSSxFQUNKLFNBQVMs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