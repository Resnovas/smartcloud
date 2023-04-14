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
                const test = await evaluator_js_1.evaluator.call(this, convention, this.context.props);
                if (test) {
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
            });
        }
    }
}
exports.requestApprovals = requestApprovals;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC1hcHByb3ZhbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udGV4dHMvbWV0aG9kcy9yZXF1ZXN0LWFwcHJvdmFscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHOzs7QUFHSCxpREFBb0Q7QUFDcEQscURBQTZDO0FBOEJ0QyxLQUFLLFVBQVUsZ0JBQWdCO0lBQ3JDLElBQUEsZ0JBQUcsRUFBQywwQkFBYSxDQUFDLElBQUksRUFBRSw4QkFBOEIsQ0FBQyxDQUFDO0lBQ3hELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxnQkFBZ0IsQ0FBQztJQUN2RCxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7UUFDdEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFBLGdCQUFHLEVBQ2xCLDBCQUFhLENBQUMsS0FBSyxFQUNuQiw0Q0FBNEMsQ0FDNUMsQ0FBQyxDQUFDO0tBQ0g7SUFFRCxLQUFLLE1BQU0sS0FBSyxJQUFJLGdCQUFnQixFQUFFO1FBQ3JDLElBQUksZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDNUIsTUFBTSxXQUFXLEdBQUcsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDNUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFO2dCQUNyRSxJQUFBLGdCQUFHLEVBQ0YsMEJBQWEsQ0FBQyxLQUFLLEVBQ25CLHVEQUF1RCxHQUFHLEtBQUssQ0FDL0QsQ0FBQztnQkFDRixNQUFNLElBQUksS0FBSyxDQUFDLHVEQUF1RCxHQUFHLEtBQUssQ0FBQyxDQUFDO2FBQ2pGO1lBRUQscURBQXFEO1lBQ3JELFdBQVcsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBQyxVQUFVLEVBQUMsRUFBRTtnQkFDaEQsSUFBSSxDQUFDLFVBQVUsRUFBRTtvQkFDaEIsT0FBTztpQkFDUDtnQkFFRCxNQUFNLElBQUksR0FBRyxNQUFNLHdCQUFTLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFeEUsSUFBSSxJQUFJLEVBQUU7b0JBQ1QsSUFBQSxnQkFBRyxFQUFDLDBCQUFhLENBQUMsSUFBSSxFQUFFLG9DQUFvQyxDQUFDLENBQUM7b0JBQzlELE1BQU0sSUFBSSxHQUNSLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxhQUFhLEtBQUssU0FBUzt3QkFDbkQsQ0FBQyxDQUFDLEVBQUU7d0JBQ0osQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLGFBQWEsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQzswQkFDOUQsQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLFdBQVcsS0FBSyxTQUFTOzRCQUNqRCxDQUFDLENBQUMsbUZBQW1GOzRCQUNyRixDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsV0FBVyxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDOzBCQUM1RCxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsYUFBYSxLQUFLLFNBQVM7NEJBQ25ELENBQUMsQ0FBQyxFQUFFOzRCQUNKLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO29CQUNoRCxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPO3lCQUN0QyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQzt5QkFDbEUsS0FBSyxDQUFDLEdBQUcsRUFBRTt3QkFDWCxNQUFNLElBQUksS0FBSyxDQUFDLElBQUEsZ0JBQUcsRUFDbEIsMEJBQWEsQ0FBQyxLQUFLLEVBQ25CLDBDQUEwQyxDQUMxQyxDQUFDLENBQUM7b0JBQ0osQ0FBQyxDQUFDLENBQUM7b0JBQ0osT0FBTyxJQUFJLENBQUMsYUFBYTt5QkFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsRUFBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBQyxDQUFDO3lCQUN4RCxLQUFLLENBQUMsR0FBRyxFQUFFO3dCQUNYLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBQSxnQkFBRyxFQUNsQiwwQkFBYSxDQUFDLEtBQUssRUFDbkIsMENBQTBDLENBQzFDLENBQUMsQ0FBQztvQkFDSixDQUFDLENBQUMsQ0FBQztpQkFDSjtZQUNGLENBQUMsQ0FBQyxDQUFDO1NBQ0g7S0FDRDtBQUNGLENBQUM7QUE3REQsNENBNkRDIn0=