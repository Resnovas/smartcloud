"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: auto-approve.ts
 * Path: \src\contexts\methods\auto-approve.ts
 * Created Date: Monday, September 5th 2022
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
exports.automaticApprove = void 0;
const tslib_1 = require("tslib");
const core = tslib_1.__importStar(require("@actions/core"));
const logging_js_1 = require("../../logging.js");
const evaluator_js_1 = require("../../evaluator.js");
function automaticApprove() {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        (0, logging_js_1.log)(logging_js_1.LoggingLevels.info, 'Starting Automatic Approved');
        const automaticApprove = (_a = this.config) === null || _a === void 0 ? void 0 : _a.automaticApprove;
        if (!automaticApprove || !automaticApprove.condition) {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Not Able to automatically approve'));
        }
        // Todo: change to for loop
        // eslint-disable-next-line unicorn/no-array-for-each
        automaticApprove.condition.forEach((convention) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            var _b;
            if (!convention.condition) {
                return;
            }
            if (yield evaluator_js_1.evaluator.call(this, convention, this.context.props)) {
                (0, logging_js_1.log)(logging_js_1.LoggingLevels.info, 'Automatically Approved Successfully');
                const body = (automaticApprove.commentHeader === undefined
                    ? ''
                    : automaticApprove.commentHeader + '\n\n')
                    + (automaticApprove.commentBody === undefined
                        ? 'Automatically Approved - Will automatically merge shortly! \n\n'
                        : automaticApprove.commentBody + '\n\n')
                    + ((_b = automaticApprove.commentFooter) !== null && _b !== void 0 ? _b : '');
                yield this.createComment.bind(this)('Automatic Approval', false, { event: 'APPROVE', body })
                    .catch(() => {
                    throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Unable to automatically approve'));
                });
                return;
            }
            core.setFailed(convention.failedComment);
            return false;
        }));
    });
}
exports.automaticApprove = automaticApprove;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0by1hcHByb3ZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbnRleHRzL21ldGhvZHMvYXV0by1hcHByb3ZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQ0c7Ozs7QUFFSCw0REFBc0M7QUFDdEMsaURBQW9EO0FBR3BELHFEQUE2QztBQXlCN0MsU0FBc0IsZ0JBQWdCOzs7UUFDckMsSUFBQSxnQkFBRyxFQUFDLDBCQUFhLENBQUMsSUFBSSxFQUFFLDZCQUE2QixDQUFDLENBQUM7UUFDdkQsTUFBTSxnQkFBZ0IsR0FBRyxNQUFBLElBQUksQ0FBQyxNQUFNLDBDQUFFLGdCQUFnQixDQUFDO1FBQ3ZELElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRTtZQUNyRCxNQUFNLElBQUksS0FBSyxDQUFDLElBQUEsZ0JBQUcsRUFDbEIsMEJBQWEsQ0FBQyxLQUFLLEVBQ25CLG1DQUFtQyxDQUNuQyxDQUFDLENBQUM7U0FDSDtRQUVELDJCQUEyQjtRQUMzQixxREFBcUQ7UUFDckQsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFNLFVBQVUsRUFBQyxFQUFFOztZQUNyRCxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRTtnQkFDMUIsT0FBTzthQUNQO1lBRUQsSUFBSSxNQUFNLHdCQUFTLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDL0QsSUFBQSxnQkFBRyxFQUFDLDBCQUFhLENBQUMsSUFBSSxFQUFFLHFDQUFxQyxDQUFDLENBQUM7Z0JBRS9ELE1BQU0sSUFBSSxHQUNQLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxLQUFLLFNBQVM7b0JBQzlDLENBQUMsQ0FBQyxFQUFFO29CQUNKLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDO3NCQUN6QyxDQUFDLGdCQUFnQixDQUFDLFdBQVcsS0FBSyxTQUFTO3dCQUM1QyxDQUFDLENBQUMsaUVBQWlFO3dCQUNuRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQztzQkFDdkMsQ0FBQyxNQUFBLGdCQUFnQixDQUFDLGFBQWEsbUNBQUksRUFBRSxDQUFDLENBQUM7Z0JBRTFDLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsb0JBQW9CLEVBQUUsS0FBSyxFQUFFLEVBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUMsQ0FBQztxQkFDeEYsS0FBSyxDQUFDLEdBQUcsRUFBRTtvQkFDWCxNQUFNLElBQUksS0FBSyxDQUFDLElBQUEsZ0JBQUcsRUFBQywwQkFBYSxDQUFDLEtBQUssRUFBRSxpQ0FBaUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlFLENBQUMsQ0FBQyxDQUFDO2dCQUNKLE9BQU87YUFDUDtZQUVELElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3pDLE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQyxDQUFBLENBQUMsQ0FBQzs7Q0FDSDtBQXZDRCw0Q0F1Q0MifQ==