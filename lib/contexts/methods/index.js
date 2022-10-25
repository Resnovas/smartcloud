/*
 * Project: @resnovas/smartcloud
 * File: index.ts
 * Path: \src\contexts\methods\index.ts
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
 * Last Modified: 24-10-2022
 * By: Jonathan Stevens (Email: jonathan@resnovas.com, Github: https://github.com/TGTGamer)
 * Current Version: 1.0.0-beta.0
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */
import process from 'node:process';
import { log, LoggingLevels } from '../../logging.js';
import { applyLabels } from './apply-labels.js';
import { assignProject } from './assign-project.js';
import { automaticApprove } from './auto-approve.js';
import { bumpVersion } from './bump-version.js';
import { checkStale } from './check-stale.js';
import * as conventions from './conventions.js';
import { requestApprovals } from './request-approvals.js';
import { syncRemoteProject } from './sync-remote-project.js';
export * from './apply-labels.js';
export * from './assign-project.js';
export * from './auto-approve.js';
export * from './changelog.js';
export * from './check-stale.js';
export * from './conventions.js';
export * from './create-branch.js';
export * from './handle-milestone.js';
export * from './release.js';
export * from './sync-remote-project.js';
export * from './sync-remote-repo.js';
export class Contexts {
    runners;
    runnerConfigs;
    config;
    curContext;
    context;
    newVersion = {};
    util;
    retryLimit;
    dryRun;
    conventions = {
        enforce: async (that) => conventions.enforce.bind(that),
    };
    // eslint-disable-next-line max-params
    constructor(util, runners, configs, curContext, dryRun) {
        if (!runners) {
            throw new Error('Cannot construct without configs');
        }
        this.runners = runners;
        if (!configs) {
            throw new Error(log(LoggingLevels.error, 'Cannot construct without configs'));
        }
        this.runnerConfigs = configs;
        if (!curContext) {
            throw new Error(log(LoggingLevels.error, 'Cannot construct without context'));
        }
        this.curContext = curContext;
        const config = configs[curContext.type];
        if (!config) {
            throw new Error(log(LoggingLevels.error, 'Cannot construct without config'));
        }
        this.config = config;
        if (curContext.type !== 'schedule') {
            this.newVersion = curContext.context.currentVersion;
        }
        this.context = curContext.context;
        this.util = util;
        this.dryRun = dryRun;
        this.retryLimit = configs.retryLimit ?? 3;
    }
    syncRemoteProject = async (that) => syncRemoteProject.bind(that);
    assignProject = async (that) => assignProject.bind(that);
    applyLabels = async (that) => applyLabels.bind(that);
    checkStale = async (that, context, config) => checkStale.call(that, context, config);
    automaticApprove = async (that) => automaticApprove.bind(that);
    requestApprovals = async (that) => requestApprovals.bind(that);
    bumpVersion = async (that) => bumpVersion.bind(that);
    async createComment(jobName, success, options) {
        const prefix = `<!--${String(process.env.NPM_PACKAGE_NAME)}: ${jobName}-->`;
        const body = prefix + String(options?.body === undefined ? '' : '\n\r\n\r' + String(options?.body));
        const commentList = this.context.props?.type === 'pr'
            ? await this.util.api.pullRequests.reviews.list(this.context.props.number)
            : ('number' in this.context.props
                // @ts-expect-error if it gets here something has changed :)
                ? await this.util.api.issues.comments.list(this.context.props.number)
                : undefined);
        let previousComment;
        if (commentList) {
            // eslint-disable-next-line unicorn/no-array-for-each
            commentList.forEach(comment => {
                if (comment.body?.includes(prefix)
                    && (!('state' in comment) || comment.state !== 'DISMISSED')) {
                    previousComment = comment.id;
                }
            });
        }
        await this.util.respond(this, success, {
            event: options?.event,
            previousComment,
            body,
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udGV4dHMvbWV0aG9kcy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQ0c7QUFDSCxPQUFPLE9BQU8sTUFBTSxjQUFjLENBQUM7QUFpQm5DLE9BQU8sRUFBQyxHQUFHLEVBQUUsYUFBYSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDcEQsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQzlDLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNsRCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNuRCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDOUMsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQzVDLE9BQU8sS0FBSyxXQUFXLE1BQU0sa0JBQWtCLENBQUM7QUFDaEQsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDeEQsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFFM0QsY0FBYyxtQkFBbUIsQ0FBQztBQUNsQyxjQUFjLHFCQUFxQixDQUFDO0FBQ3BDLGNBQWMsbUJBQW1CLENBQUM7QUFDbEMsY0FBYyxnQkFBZ0IsQ0FBQztBQUMvQixjQUFjLGtCQUFrQixDQUFDO0FBQ2pDLGNBQWMsa0JBQWtCLENBQUM7QUFDakMsY0FBYyxvQkFBb0IsQ0FBQztBQUNuQyxjQUFjLHVCQUF1QixDQUFDO0FBQ3RDLGNBQWMsY0FBYyxDQUFDO0FBQzdCLGNBQWMsMEJBQTBCLENBQUM7QUFDekMsY0FBYyx1QkFBdUIsQ0FBQztBQUV0QyxNQUFNLE9BQU8sUUFBUTtJQUNwQixPQUFPLENBQVU7SUFDakIsYUFBYSxDQUFTO0lBQ3RCLE1BQU0sQ0FBa0Q7SUFDeEQsVUFBVSxDQUFhO0lBQ3ZCLE9BQU8sQ0FBdUU7SUFDOUUsVUFBVSxHQUFhLEVBQUUsQ0FBQztJQUMxQixJQUFJLENBQVE7SUFDWixVQUFVLENBQVM7SUFDbkIsTUFBTSxDQUFVO0lBQ2hCLFdBQVcsR0FBRztRQUNiLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBYyxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7S0FDakUsQ0FBQztJQUVGLHNDQUFzQztJQUN0QyxZQUNDLElBQVcsRUFDWCxPQUFnQixFQUNoQixPQUFlLEVBQ2YsVUFBc0IsRUFDdEIsTUFBZTtRQUVmLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDYixNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7U0FDcEQ7UUFFRCxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2IsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQ2xCLGFBQWEsQ0FBQyxLQUFLLEVBQ25CLGtDQUFrQyxDQUNsQyxDQUFDLENBQUM7U0FDSDtRQUVELElBQUksQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDO1FBQzdCLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDaEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQ2xCLGFBQWEsQ0FBQyxLQUFLLEVBQ25CLGtDQUFrQyxDQUNsQyxDQUFDLENBQUM7U0FDSDtRQUVELElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNaLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxDQUNsQixhQUFhLENBQUMsS0FBSyxFQUNuQixpQ0FBaUMsQ0FDakMsQ0FBQyxDQUFDO1NBQ0g7UUFFRCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLFVBQVUsQ0FBQyxJQUFJLEtBQUssVUFBVSxFQUFFO1lBQ25DLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUM7U0FDcEQ7UUFFRCxJQUFJLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUM7UUFDbEMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRUQsaUJBQWlCLEdBQUcsS0FBSyxFQUFFLElBQWEsRUFBRSxFQUFFLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFFLGFBQWEsR0FBRyxLQUFLLEVBQUUsSUFBMkIsRUFBRSxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUVoRixXQUFXLEdBQUcsS0FBSyxFQUFFLElBQWMsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMvRCxVQUFVLEdBQUcsS0FBSyxFQUNqQixJQUFjLEVBQ2QsT0FBNEYsRUFDNUYsTUFBdUUsRUFDdEUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUU1QyxnQkFBZ0IsR0FBRyxLQUFLLEVBQUUsSUFBa0IsRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzdFLGdCQUFnQixHQUFHLEtBQUssRUFBRSxJQUFrQixFQUFFLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0UsV0FBVyxHQUFHLEtBQUssRUFBRSxJQUFrQixFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRW5FLEtBQUssQ0FBQyxhQUFhLENBRWxCLE9BQWUsRUFDZixPQUFnQixFQUNoQixPQUF3QztRQUV4QyxNQUFNLE1BQU0sR0FBRyxPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEtBQUssT0FBTyxLQUFLLENBQUM7UUFDNUUsTUFBTSxJQUFJLEdBQ1AsTUFBTSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsSUFBSSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRTFGLE1BQU0sV0FBVyxHQUNkLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksS0FBSyxJQUFJO1lBQ2xDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUMxRSxDQUFDLENBQUMsQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLO2dCQUNoQyw0REFBNEQ7Z0JBQzVELENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztnQkFDckUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2hCLElBQUksZUFBbUMsQ0FBQztRQUV4QyxJQUFJLFdBQVcsRUFBRTtZQUNoQixxREFBcUQ7WUFDckQsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDN0IsSUFDQyxPQUFPLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUM7dUJBQzNCLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsSUFBSSxPQUFPLENBQUMsS0FBSyxLQUFLLFdBQVcsQ0FBQyxFQUMxRDtvQkFDRCxlQUFlLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQztpQkFDN0I7WUFDRixDQUFDLENBQUMsQ0FBQztTQUNIO1FBRUQsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFO1lBQ3RDLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSztZQUNyQixlQUFlO1lBQ2YsSUFBSTtTQUNKLENBQUMsQ0FBQztJQUNKLENBQUM7Q0FDRCJ9