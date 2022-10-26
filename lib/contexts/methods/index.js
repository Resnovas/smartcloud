"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contexts = void 0;
const tslib_1 = require("tslib");
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
const node_process_1 = tslib_1.__importDefault(require("node:process"));
const logging_js_1 = require("../../logging.js");
const apply_labels_js_1 = require("./apply-labels.js");
const assign_project_js_1 = require("./assign-project.js");
const auto_approve_js_1 = require("./auto-approve.js");
const bump_version_js_1 = require("./bump-version.js");
const check_stale_js_1 = require("./check-stale.js");
const conventions = tslib_1.__importStar(require("./conventions.js"));
const request_approvals_js_1 = require("./request-approvals.js");
const sync_remote_project_js_1 = require("./sync-remote-project.js");
tslib_1.__exportStar(require("./apply-labels.js"), exports);
tslib_1.__exportStar(require("./assign-project.js"), exports);
tslib_1.__exportStar(require("./auto-approve.js"), exports);
tslib_1.__exportStar(require("./changelog.js"), exports);
tslib_1.__exportStar(require("./check-stale.js"), exports);
tslib_1.__exportStar(require("./conventions.js"), exports);
tslib_1.__exportStar(require("./create-branch.js"), exports);
tslib_1.__exportStar(require("./handle-milestone.js"), exports);
tslib_1.__exportStar(require("./release.js"), exports);
tslib_1.__exportStar(require("./sync-remote-project.js"), exports);
tslib_1.__exportStar(require("./sync-remote-repo.js"), exports);
class Contexts {
    // eslint-disable-next-line max-params
    constructor(util, runners, configs, curContext, dryRun) {
        this.newVersion = {};
        this.conventions = {
            enforce: async (that) => conventions.enforce.bind(that),
        };
        this.syncRemoteProject = async (that) => sync_remote_project_js_1.syncRemoteProject.bind(that);
        this.assignProject = async (that) => assign_project_js_1.assignProject.bind(that);
        this.applyLabels = async (that) => apply_labels_js_1.applyLabels.bind(that);
        this.checkStale = async (that, context, config) => check_stale_js_1.checkStale.call(that, context, config);
        this.automaticApprove = async (that) => auto_approve_js_1.automaticApprove.bind(that);
        this.requestApprovals = async (that) => request_approvals_js_1.requestApprovals.bind(that);
        this.bumpVersion = async (that) => bump_version_js_1.bumpVersion.bind(that);
        if (!runners) {
            throw new Error('Cannot construct without configs');
        }
        this.runners = runners;
        if (!configs) {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Cannot construct without configs'));
        }
        this.runnerConfigs = configs;
        if (!curContext) {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Cannot construct without context'));
        }
        this.curContext = curContext;
        const config = configs[curContext.type];
        if (!config) {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Cannot construct without config'));
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
    async createComment(jobName, success, options) {
        const prefix = `<!--${String(node_process_1.default.env.NPM_PACKAGE_NAME)}: ${jobName}-->`;
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
exports.Contexts = Contexts;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udGV4dHMvbWV0aG9kcy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHO0FBQ0gsd0VBQW1DO0FBaUJuQyxpREFBb0Q7QUFDcEQsdURBQThDO0FBQzlDLDJEQUFrRDtBQUNsRCx1REFBbUQ7QUFDbkQsdURBQThDO0FBQzlDLHFEQUE0QztBQUM1QyxzRUFBZ0Q7QUFDaEQsaUVBQXdEO0FBQ3hELHFFQUEyRDtBQUUzRCw0REFBa0M7QUFDbEMsOERBQW9DO0FBQ3BDLDREQUFrQztBQUNsQyx5REFBK0I7QUFDL0IsMkRBQWlDO0FBQ2pDLDJEQUFpQztBQUNqQyw2REFBbUM7QUFDbkMsZ0VBQXNDO0FBQ3RDLHVEQUE2QjtBQUM3QixtRUFBeUM7QUFDekMsZ0VBQXNDO0FBRXRDLE1BQWEsUUFBUTtJQWNwQixzQ0FBc0M7SUFDdEMsWUFDQyxJQUFXLEVBQ1gsT0FBZ0IsRUFDaEIsT0FBZSxFQUNmLFVBQXNCLEVBQ3RCLE1BQWU7UUFkaEIsZUFBVSxHQUFhLEVBQUUsQ0FBQztRQUkxQixnQkFBVyxHQUFHO1lBQ2IsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFjLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztTQUNqRSxDQUFDO1FBa0RGLHNCQUFpQixHQUFHLEtBQUssRUFBRSxJQUFhLEVBQUUsRUFBRSxDQUFDLDBDQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxRSxrQkFBYSxHQUFHLEtBQUssRUFBRSxJQUEyQixFQUFFLEVBQUUsQ0FBQyxpQ0FBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVoRixnQkFBVyxHQUFHLEtBQUssRUFBRSxJQUFjLEVBQUUsRUFBRSxDQUFDLDZCQUFXLENB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