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
import * as core from '@actions/core';
import { LoggingLevels, log } from '../../logging.js';
import { evaluator } from '../../evaluator.js';
export async function automaticApprove() {
    log(LoggingLevels.info, 'Starting Automatic Approved');
    const automaticApprove = this.config?.automaticApprove;
    if (!automaticApprove || !automaticApprove.condition) {
        throw new Error(log(LoggingLevels.error, 'Not Able to automatically approve'));
    }
    // Todo: change to for loop
    // eslint-disable-next-line unicorn/no-array-for-each
    automaticApprove.condition.forEach(async (convention) => {
        if (!convention.condition) {
            return;
        }
        if (await evaluator.call(this, convention, this.context.props)) {
            log(LoggingLevels.info, 'Automatically Approved Successfully');
            const body = (automaticApprove.commentHeader === undefined
                ? ''
                : automaticApprove.commentHeader + '\n\n')
                + (automaticApprove.commentBody === undefined
                    ? 'Automatically Approved - Will automatically merge shortly! \n\n'
                    : automaticApprove.commentBody + '\n\n')
                + (automaticApprove.commentFooter ?? '');
            await this.createComment.bind(this)('Automatic Approval', false, { event: 'APPROVE', body })
                .catch(() => {
                throw new Error(log(LoggingLevels.error, 'Unable to automatically approve'));
            });
            return;
        }
        core.setFailed(convention.failedComment);
        return false;
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0by1hcHByb3ZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbnRleHRzL21ldGhvZHMvYXV0by1hcHByb3ZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNDRztBQUVILE9BQU8sS0FBSyxJQUFJLE1BQU0sZUFBZSxDQUFDO0FBQ3RDLE9BQU8sRUFBQyxhQUFhLEVBQUUsR0FBRyxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFHcEQsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBeUI3QyxNQUFNLENBQUMsS0FBSyxVQUFVLGdCQUFnQjtJQUNyQyxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSw2QkFBNkIsQ0FBQyxDQUFDO0lBQ3ZELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxnQkFBZ0IsQ0FBQztJQUN2RCxJQUFJLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUU7UUFDckQsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQ2xCLGFBQWEsQ0FBQyxLQUFLLEVBQ25CLG1DQUFtQyxDQUNuQyxDQUFDLENBQUM7S0FDSDtJQUVELDJCQUEyQjtJQUMzQixxREFBcUQ7SUFDckQsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUMsVUFBVSxFQUFDLEVBQUU7UUFDckQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUU7WUFDMUIsT0FBTztTQUNQO1FBRUQsSUFBSSxNQUFNLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQy9ELEdBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLHFDQUFxQyxDQUFDLENBQUM7WUFFL0QsTUFBTSxJQUFJLEdBQ1AsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEtBQUssU0FBUztnQkFDOUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ0osQ0FBQyxDQUFDLGdCQUFnQixDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUM7a0JBQ3pDLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxLQUFLLFNBQVM7b0JBQzVDLENBQUMsQ0FBQyxpRUFBaUU7b0JBQ25FLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDO2tCQUN2QyxDQUFDLGdCQUFnQixDQUFDLGFBQWEsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUUxQyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLG9CQUFvQixFQUFFLEtBQUssRUFBRSxFQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFDLENBQUM7aUJBQ3hGLEtBQUssQ0FBQyxHQUFHLEVBQUU7Z0JBQ1gsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxpQ0FBaUMsQ0FBQyxDQUFDLENBQUM7WUFDOUUsQ0FBQyxDQUFDLENBQUM7WUFDSixPQUFPO1NBQ1A7UUFFRCxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN6QyxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQyJ9