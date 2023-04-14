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
async function automaticApprove() {
    (0, logging_js_1.log)(logging_js_1.LoggingLevels.info, 'Starting Automatic Approved');
    const automaticApprove = this.config?.automaticApprove;
    if (!automaticApprove || !automaticApprove.condition) {
        throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Not Able to automatically approve'));
    }
    // Todo: change to for loop
    // eslint-disable-next-line unicorn/no-array-for-each
    automaticApprove.condition.forEach(async (convention) => {
        if (!convention.condition) {
            return;
        }
        if (await evaluator_js_1.evaluator.call(this, convention, this.context.props)) {
            (0, logging_js_1.log)(logging_js_1.LoggingLevels.info, 'Automatically Approved Successfully');
            const body = (automaticApprove.commentHeader === undefined
                ? ''
                : automaticApprove.commentHeader + '\n\n')
                + (automaticApprove.commentBody === undefined
                    ? 'Automatically Approved - Will automatically merge shortly! \n\n'
                    : automaticApprove.commentBody + '\n\n')
                + (automaticApprove.commentFooter ?? '');
            await this.createComment.bind(this)('Automatic Approval', false, { event: 'APPROVE', body })
                .catch(() => {
                throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Unable to automatically approve'));
            });
            return;
        }
        core.setFailed(convention.failedComment);
        return false;
    });
}
exports.automaticApprove = automaticApprove;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0by1hcHByb3ZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbnRleHRzL21ldGhvZHMvYXV0by1hcHByb3ZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQ0c7Ozs7QUFFSCw0REFBc0M7QUFDdEMsaURBQW9EO0FBR3BELHFEQUE2QztBQXlCdEMsS0FBSyxVQUFVLGdCQUFnQjtJQUNyQyxJQUFBLGdCQUFHLEVBQUMsMEJBQWEsQ0FBQyxJQUFJLEVBQUUsNkJBQTZCLENBQUMsQ0FBQztJQUN2RCxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLENBQUM7SUFDdkQsSUFBSSxDQUFDLGdCQUFnQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFO1FBQ3JELE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBQSxnQkFBRyxFQUNsQiwwQkFBYSxDQUFDLEtBQUssRUFDbkIsbUNBQW1DLENBQ25DLENBQUMsQ0FBQztLQUNIO0lBRUQsMkJBQTJCO0lBQzNCLHFEQUFxRDtJQUNyRCxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBQyxVQUFVLEVBQUMsRUFBRTtRQUNyRCxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRTtZQUMxQixPQUFPO1NBQ1A7UUFFRCxJQUFJLE1BQU0sd0JBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQy9ELElBQUEsZ0JBQUcsRUFBQywwQkFBYSxDQUFDLElBQUksRUFBRSxxQ0FBcUMsQ0FBQyxDQUFDO1lBRS9ELE1BQU0sSUFBSSxHQUNQLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxLQUFLLFNBQVM7Z0JBQzlDLENBQUMsQ0FBQyxFQUFFO2dCQUNKLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDO2tCQUN6QyxDQUFDLGdCQUFnQixDQUFDLFdBQVcsS0FBSyxTQUFTO29CQUM1QyxDQUFDLENBQUMsaUVBQWlFO29CQUNuRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQztrQkFDdkMsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLElBQUksRUFBRSxDQUFDLENBQUM7WUFFMUMsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxLQUFLLEVBQUUsRUFBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBQyxDQUFDO2lCQUN4RixLQUFLLENBQUMsR0FBRyxFQUFFO2dCQUNYLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBQSxnQkFBRyxFQUFDLDBCQUFhLENBQUMsS0FBSyxFQUFFLGlDQUFpQyxDQUFDLENBQUMsQ0FBQztZQUM5RSxDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU87U0FDUDtRQUVELElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3pDLE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDO0FBdkNELDRDQXVDQyJ9