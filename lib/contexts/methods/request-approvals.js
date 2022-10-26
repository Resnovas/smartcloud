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
async function requestApprovals() {
    (0, logging_js_1.log)(logging_js_1.LoggingLevels.info, 'Starting to Request Approval');
    const requestApprovals = this.config?.requestApprovals;
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
            groupConfig.condition.forEach(async (convention) => {
                if (!convention) {
                    return;
                }
                if (await evaluator_js_1.evaluator.call(this, convention, this.context.props)) {
                    (0, logging_js_1.log)(logging_js_1.LoggingLevels.info, 'Automatically Requesting Approvers');
                    const body = (groupConfig?.comment?.commentHeader === undefined
                        ? ''
                        : String(groupConfig?.comment?.commentHeader) + String('\n\n'))
                        + (groupConfig?.comment?.commentBody === undefined
                            ? 'Automatically Requesting Approvers - Will automatically merge once approved! \n\n'
                            : String(groupConfig?.comment?.commentBody) + String('\n\n'))
                        + (groupConfig?.comment?.commentFooter === undefined
                            ? ''
                            : String(groupConfig?.comment?.commentFooter));
                    await this.util.api.pullRequests.reviews
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
            });
            return;
        }
    }
}
exports.requestApprovals = requestApprovals;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC1hcHByb3ZhbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udGV4dHMvbWV0aG9kcy9yZXF1ZXN0LWFwcHJvdmFscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHOzs7O0FBRUgsNERBQXNDO0FBRXRDLGlEQUFvRDtBQUNwRCxxREFBNkM7QUE4QnRDLEtBQUssVUFBVSxnQkFBZ0I7SUFDckMsSUFBQSxnQkFBRyxFQUFDLDBCQUFhLENBQUMsSUFBSSxFQUFFLDhCQUE4QixDQUFDLENBQUM7SUFDeEQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLGdCQUFnQixDQUFDO0lBQ3ZELElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtRQUN0QixNQUFNLElBQUksS0FBSyxDQUFDLElBQUEsZ0JBQUcsRUFDbEIsMEJBQWEsQ0FBQyxLQUFLLEVBQ25CLDRDQUE0QyxDQUM1QyxDQUFDLENBQUM7S0FDSDtJQUVELEtBQUssTUFBTSxLQUFLLElBQUksZ0JBQWdCLEVBQUU7UUFDckMsSUFBSSxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUM1QixNQUFNLFdBQVcsR0FBRyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM1QyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUU7Z0JBQ3JFLElBQUEsZ0JBQUcsRUFDRiwwQkFBYSxDQUFDLEtBQUssRUFDbkIsdURBQXVELEdBQUcsS0FBSyxDQUMvRCxDQUFDO2dCQUNGLE1BQU0sSUFBSSxLQUFLLENBQUMsdURBQXVELEdBQUcsS0FBSyxDQUFDLENBQUM7YUFDakY7WUFFRCxxREFBcUQ7WUFDckQsV0FBVyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFDLFVBQVUsRUFBQyxFQUFFO2dCQUNoRCxJQUFJLENBQUMsVUFBVSxFQUFFO29CQUNoQixPQUFPO2lCQUNQO2dCQUVELElBQUksTUFBTSx3QkFBUyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQy9ELElBQUEsZ0JBQUcsRUFBQywwQkFBYSxDQUFDLElBQUksRUFBRSxvQ0FBb0MsQ0FBQyxDQUFDO29CQUM5RCxNQUFNLElBQUksR0FDUixDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsYUFBYSxLQUFLLFNBQVM7d0JBQ25ELENBQUMsQ0FBQyxFQUFFO3dCQUNKLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxhQUFhLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7MEJBQzlELENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxXQUFXLEtBQUssU0FBUzs0QkFDakQsQ0FBQyxDQUFDLG1GQUFtRjs0QkFDckYsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLFdBQVcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQzswQkFDNUQsQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLGFBQWEsS0FBSyxTQUFTOzRCQUNuRCxDQUFDLENBQUMsRUFBRTs0QkFDSixDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQztvQkFDaEQsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTzt5QkFDdEMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUM7eUJBQ2xFLEtBQUssQ0FBQyxHQUFHLEVBQUU7d0JBQ1gsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFBLGdCQUFHLEVBQ2xCLDBCQUFhLENBQUMsS0FBSyxFQUNuQiwwQ0FBMEMsQ0FDMUMsQ0FBQyxDQUFDO29CQUNKLENBQUMsQ0FBQyxDQUFDO29CQUNKLE9BQU8sSUFBSSxDQUFDLGFBQWE7eUJBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLEVBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUMsQ0FBQzt5QkFDeEQsS0FBSyxDQUFDLEdBQUcsRUFBRTt3QkFDWCxNQUFNLElBQUksS0FBSyxDQUFDLElBQUEsZ0JBQUcsRUFDbEIsMEJBQWEsQ0FBQyxLQUFLLEVBQ25CLDBDQUEwQyxDQUMxQyxDQUFDLENBQUM7b0JBQ0osQ0FBQyxDQUFDLENBQUM7aUJBQ0o7Z0JBRUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ3pDLE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQUM7WUFDSCxPQUFPO1NBQ1A7S0FDRDtBQUNGLENBQUM7QUEvREQsNENBK0RDIn0=