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
import * as core from '@actions/core';
import { log, LoggingLevels } from '../../logging.js';
import { evaluator } from '../../evaluator.js';
export async function requestApprovals() {
    log(LoggingLevels.info, 'Starting to Request Approval');
    const requestApprovals = this.config?.requestApprovals;
    if (!requestApprovals) {
        throw new Error(log(LoggingLevels.error, 'Not Able to automatically request approval'));
    }
    for (const group in requestApprovals) {
        if (requestApprovals[group]) {
            const groupConfig = requestApprovals[group];
            if (!groupConfig || !groupConfig.condition || !groupConfig.reviewers) {
                log(LoggingLevels.error, 'Not Able to automatically request approval for group ' + group);
                throw new Error('Not Able to automatically request approval for group ' + group);
            }
            // eslint-disable-next-line unicorn/no-array-for-each
            groupConfig.condition.forEach(async (convention) => {
                if (!convention) {
                    return;
                }
                if (await evaluator.call(this, convention, this.context.props)) {
                    log(LoggingLevels.info, 'Automatically Requesting Approvers');
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
                        throw new Error(log(LoggingLevels.error, 'Unable to automatically request approval'));
                    });
                    return this.createComment
                        .bind(this)('Approvals', false, { event: 'COMMENT', body })
                        .catch(() => {
                        throw new Error(log(LoggingLevels.error, 'Unable to automatically request approval'));
                    });
                }
                core.setFailed(convention.failedComment);
                return false;
            });
            return;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC1hcHByb3ZhbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udGV4dHMvbWV0aG9kcy9yZXF1ZXN0LWFwcHJvdmFscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQ0c7QUFFSCxPQUFPLEtBQUssSUFBSSxNQUFNLGVBQWUsQ0FBQztBQUV0QyxPQUFPLEVBQUMsR0FBRyxFQUFFLGFBQWEsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ3BELE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQThCN0MsTUFBTSxDQUFDLEtBQUssVUFBVSxnQkFBZ0I7SUFDckMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsOEJBQThCLENBQUMsQ0FBQztJQUN4RCxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLENBQUM7SUFDdkQsSUFBSSxDQUFDLGdCQUFnQixFQUFFO1FBQ3RCLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxDQUNsQixhQUFhLENBQUMsS0FBSyxFQUNuQiw0Q0FBNEMsQ0FDNUMsQ0FBQyxDQUFDO0tBQ0g7SUFFRCxLQUFLLE1BQU0sS0FBSyxJQUFJLGdCQUFnQixFQUFFO1FBQ3JDLElBQUksZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDNUIsTUFBTSxXQUFXLEdBQUcsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDNUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFO2dCQUNyRSxHQUFHLENBQ0YsYUFBYSxDQUFDLEtBQUssRUFDbkIsdURBQXVELEdBQUcsS0FBSyxDQUMvRCxDQUFDO2dCQUNGLE1BQU0sSUFBSSxLQUFLLENBQUMsdURBQXVELEdBQUcsS0FBSyxDQUFDLENBQUM7YUFDakY7WUFFRCxxREFBcUQ7WUFDckQsV0FBVyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFDLFVBQVUsRUFBQyxFQUFFO2dCQUNoRCxJQUFJLENBQUMsVUFBVSxFQUFFO29CQUNoQixPQUFPO2lCQUNQO2dCQUVELElBQUksTUFBTSxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtvQkFDL0QsR0FBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsb0NBQW9DLENBQUMsQ0FBQztvQkFDOUQsTUFBTSxJQUFJLEdBQ1IsQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLGFBQWEsS0FBSyxTQUFTO3dCQUNuRCxDQUFDLENBQUMsRUFBRTt3QkFDSixDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsYUFBYSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDOzBCQUM5RCxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsV0FBVyxLQUFLLFNBQVM7NEJBQ2pELENBQUMsQ0FBQyxtRkFBbUY7NEJBQ3JGLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxXQUFXLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7MEJBQzVELENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxhQUFhLEtBQUssU0FBUzs0QkFDbkQsQ0FBQyxDQUFDLEVBQUU7NEJBQ0osQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7b0JBQ2hELE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU87eUJBQ3RDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsU0FBUyxDQUFDO3lCQUNsRSxLQUFLLENBQUMsR0FBRyxFQUFFO3dCQUNYLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxDQUNsQixhQUFhLENBQUMsS0FBSyxFQUNuQiwwQ0FBMEMsQ0FDMUMsQ0FBQyxDQUFDO29CQUNKLENBQUMsQ0FBQyxDQUFDO29CQUNKLE9BQU8sSUFBSSxDQUFDLGFBQWE7eUJBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLEVBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUMsQ0FBQzt5QkFDeEQsS0FBSyxDQUFDLEdBQUcsRUFBRTt3QkFDWCxNQUFNLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FDbEIsYUFBYSxDQUFDLEtBQUssRUFDbkIsMENBQTBDLENBQzFDLENBQUMsQ0FBQztvQkFDSixDQUFDLENBQUMsQ0FBQztpQkFDSjtnQkFFRCxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDekMsT0FBTyxLQUFLLENBQUM7WUFDZCxDQUFDLENBQUMsQ0FBQztZQUNILE9BQU87U0FDUDtLQUNEO0FBQ0YsQ0FBQyJ9