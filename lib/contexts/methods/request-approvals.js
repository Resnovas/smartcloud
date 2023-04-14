"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: request-approvals.ts
 * Path: \src\contexts\methods\request-approvals.ts
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
exports.requestApprovals = void 0;
const tslib_1 = require("tslib");
const core = tslib_1.__importStar(require("@actions/core"));
const logging_js_1 = require("../../logging.js");
const evaluator_js_1 = require("../../evaluator.js");
function requestApprovals() {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        (0, logging_js_1.log)(logging_js_1.LoggingLevels.info, 'Starting to Request Approval');
        const requestApprovals = (_a = this.config) === null || _a === void 0 ? void 0 : _a.requestApprovals;
        if (!requestApprovals) {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Not Able to automatically request approval'));
        }
        for (const group in requestApprovals) {
            if (requestApprovals[group]) {
                const groupConfig = requestApprovals[group];
                if (!groupConfig || !groupConfig.condition || !groupConfig.reviewers) {
                    (0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Not Able to automatically request approval for group ' + group);
                    throw new Error('Not Able to automatically request approval for group ' + group);
                }
                // eslint-disable-next-line unicorn/no-array-for-each
                groupConfig.condition.forEach((convention) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    var _b, _c, _d, _e, _f, _g;
                    if (!convention) {
                        return;
                    }
                    if (yield evaluator_js_1.evaluator.call(this, convention, this.context.props)) {
                        (0, logging_js_1.log)(logging_js_1.LoggingLevels.info, 'Automatically Requesting Approvers');
                        const body = (((_b = groupConfig === null || groupConfig === void 0 ? void 0 : groupConfig.comment) === null || _b === void 0 ? void 0 : _b.commentHeader) === undefined
                            ? ''
                            : String((_c = groupConfig === null || groupConfig === void 0 ? void 0 : groupConfig.comment) === null || _c === void 0 ? void 0 : _c.commentHeader) + String('\n\n'))
                            + (((_d = groupConfig === null || groupConfig === void 0 ? void 0 : groupConfig.comment) === null || _d === void 0 ? void 0 : _d.commentBody) === undefined
                                ? 'Automatically Requesting Approvers - Will automatically merge once approved! \n\n'
                                : String((_e = groupConfig === null || groupConfig === void 0 ? void 0 : groupConfig.comment) === null || _e === void 0 ? void 0 : _e.commentBody) + String('\n\n'))
                            + (((_f = groupConfig === null || groupConfig === void 0 ? void 0 : groupConfig.comment) === null || _f === void 0 ? void 0 : _f.commentFooter) === undefined
                                ? ''
                                : String((_g = groupConfig === null || groupConfig === void 0 ? void 0 : groupConfig.comment) === null || _g === void 0 ? void 0 : _g.commentFooter));
                        yield this.util.api.pullRequests.reviews
                            .requestReviewers(this.context.props.number, groupConfig.reviewers)
                            .catch(() => {
                            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Unable to automatically request approval'));
                        });
                        return this.createComment
                            .bind(this)('Approvals', false, { event: 'COMMENT', body })
                            .catch(() => {
                            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Unable to automatically request approval'));
                        });
                    }
                    core.setFailed(convention.failedComment);
                    return false;
                }));
                return;
            }
        }
    });
}
exports.requestApprovals = requestApprovals;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC1hcHByb3ZhbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udGV4dHMvbWV0aG9kcy9yZXF1ZXN0LWFwcHJvdmFscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHOzs7O0FBRUgsNERBQXNDO0FBRXRDLGlEQUFvRDtBQUNwRCxxREFBNkM7QUE4QjdDLFNBQXNCLGdCQUFnQjs7O1FBQ3JDLElBQUEsZ0JBQUcsRUFBQywwQkFBYSxDQUFDLElBQUksRUFBRSw4QkFBOEIsQ0FBQyxDQUFDO1FBQ3hELE1BQU0sZ0JBQWdCLEdBQUcsTUFBQSxJQUFJLENBQUMsTUFBTSwwQ0FBRSxnQkFBZ0IsQ0FBQztRQUN2RCxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7WUFDdEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFBLGdCQUFHLEVBQ2xCLDBCQUFhLENBQUMsS0FBSyxFQUNuQiw0Q0FBNEMsQ0FDNUMsQ0FBQyxDQUFDO1NBQ0g7UUFFRCxLQUFLLE1BQU0sS0FBSyxJQUFJLGdCQUFnQixFQUFFO1lBQ3JDLElBQUksZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQzVCLE1BQU0sV0FBVyxHQUFHLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM1QyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUU7b0JBQ3JFLElBQUEsZ0JBQUcsRUFDRiwwQkFBYSxDQUFDLEtBQUssRUFDbkIsdURBQXVELEdBQUcsS0FBSyxDQUMvRCxDQUFDO29CQUNGLE1BQU0sSUFBSSxLQUFLLENBQUMsdURBQXVELEdBQUcsS0FBSyxDQUFDLENBQUM7aUJBQ2pGO2dCQUVELHFEQUFxRDtnQkFDckQsV0FBVyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBTSxVQUFVLEVBQUMs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