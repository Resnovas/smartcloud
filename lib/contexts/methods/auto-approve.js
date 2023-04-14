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
        }
    });
}
exports.automaticApprove = automaticApprove;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0by1hcHByb3ZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbnRleHRzL21ldGhvZHMvYXV0by1hcHByb3ZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQ0c7OztBQUVILGlEQUFvRDtBQUVwRCxxREFBNkM7QUF5QnRDLEtBQUssVUFBVSxnQkFBZ0I7SUFDckMsSUFBQSxnQkFBRyxFQUFDLDBCQUFhLENBQUMsSUFBSSxFQUFFLDZCQUE2QixDQUFDLENBQUM7SUFDdkQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLGdCQUFnQixDQUFDO0lBQ3ZELElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRTtRQUNyRCxNQUFNLElBQUksS0FBSyxDQUFDLElBQUEsZ0JBQUcsRUFDbEIsMEJBQWEsQ0FBQyxLQUFLLEVBQ25CLG1DQUFtQyxDQUNuQyxDQUFDLENBQUM7S0FDSDtJQUVELDJCQUEyQjtJQUMzQixxREFBcUQ7SUFDckQsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUMsVUFBVSxFQUFDLEVBQUU7UUFDckQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUU7WUFDMUIsT0FBTztTQUNQO1FBRUQsSUFBSSxNQUFNLHdCQUFTLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUMvRCxJQUFBLGdCQUFHLEVBQUMsMEJBQWEsQ0FBQyxJQUFJLEVBQUUscUNBQXFDLENBQUMsQ0FBQztZQUUvRCxNQUFNLElBQUksR0FDUCxDQUFDLGdCQUFnQixDQUFDLGFBQWEsS0FBSyxTQUFTO2dCQUM5QyxDQUFDLENBQUMsRUFBRTtnQkFDSixDQUFDLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQztrQkFDekMsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEtBQUssU0FBUztvQkFDNUMsQ0FBQyxDQUFDLGlFQUFpRTtvQkFDbkUsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUM7a0JBQ3ZDLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBRTFDLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsb0JBQW9CLEVBQUUsS0FBSyxFQUFFLEVBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUMsQ0FBQztpQkFDeEYsS0FBSyxDQUFDLEdBQUcsRUFBRTtnQkFDWCxNQUFNLElBQUksS0FBSyxDQUFDLElBQUEsZ0JBQUcsRUFBQywwQkFBYSxDQUFDLEtBQUssRUFBRSxpQ0FBaUMsQ0FBQyxDQUFDLENBQUM7WUFDOUUsQ0FBQyxDQUFDLENBQUM7U0FDSjtJQUNGLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQW5DRCw0Q0FtQ0MifQ==