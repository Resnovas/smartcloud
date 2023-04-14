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
        var _a;
        this.newVersion = {};
        this.conventions = {
            enforce: (that) => tslib_1.__awaiter(this, void 0, void 0, function* () { return conventions.enforce.bind(that); }),
        };
        this.syncRemoteProject = (that) => tslib_1.__awaiter(this, void 0, void 0, function* () { return sync_remote_project_js_1.syncRemoteProject.bind(that); });
        this.assignProject = (that) => tslib_1.__awaiter(this, void 0, void 0, function* () { return assign_project_js_1.assignProject.bind(that); });
        this.applyLabels = (that) => tslib_1.__awaiter(this, void 0, void 0, function* () { return apply_labels_js_1.applyLabels.bind(that); });
        this.checkStale = (that, context, config) => tslib_1.__awaiter(this, void 0, void 0, function* () { return check_stale_js_1.checkStale.call(that, context, config); });
        this.automaticApprove = (that) => tslib_1.__awaiter(this, void 0, void 0, function* () { return auto_approve_js_1.automaticApprove.bind(that); });
        this.requestApprovals = (that) => tslib_1.__awaiter(this, void 0, void 0, function* () { return request_approvals_js_1.requestApprovals.bind(that); });
        this.bumpVersion = (that) => tslib_1.__awaiter(this, void 0, void 0, function* () { return bump_version_js_1.bumpVersion.bind(that); });
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
        this.retryLimit = (_a = configs.retryLimit) !== null && _a !== void 0 ? _a : 3;
    }
    createComment(jobName, success, options) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const prefix = `<!--${String(node_process_1.default.env.NPM_PACKAGE_NAME)}: ${jobName}-->`;
            const body = prefix + String((options === null || options === void 0 ? void 0 : options.body) === undefined ? '' : '\n\r\n\r' + String(options === null || options === void 0 ? void 0 : options.body));
            const commentList = ((_a = this.context.props) === null || _a === void 0 ? void 0 : _a.type) === 'pr'
                ? yield this.util.api.pullRequests.reviews.list(this.context.props.number)
                : ('number' in this.context.props
                    // @ts-expect-error if it gets here something has changed :)
                    ? yield this.util.api.issues.comments.list(this.context.props.number)
                    : undefined);
            let previousComment;
            if (commentList) {
                // eslint-disable-next-line unicorn/no-array-for-each
                commentList.forEach(comment => {
                    var _a;
                    if (((_a = comment.body) === null || _a === void 0 ? void 0 : _a.includes(prefix))
                        && (!('state' in comment) || comment.state !== 'DISMISSED')) {
                        previousComment = comment.id;
                    }
                });
            }
            yield this.util.respond(this, success, {
                event: options === null || options === void 0 ? void 0 : options.event,
                previousComment,
                body,
            });
        });
    }
}
exports.Contexts = Contexts;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udGV4dHMvbWV0aG9kcy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHO0FBQ0gsd0VBQW1DO0FBaUJuQyxpREFBb0Q7QUFDcEQsdURBQThDO0FBQzlDLDJEQUFrRDtBQUNsRCx1REFBbUQ7QUFDbkQsdURBQThDO0FBQzlDLHFEQUE0QztBQUM1QyxzRUFBZ0Q7QUFDaEQsaUVBQXdEO0FBQ3hELHFFQUEyRDtBQUUzRCw0REFBa0M7QUFDbEMsOERBQW9DO0FBQ3BDLDREQUFrQztBQUNsQyx5REFBK0I7QUFDL0IsMkRBQWlDO0FBQ2pDLDJEQUFpQztBQUNqQyw2REFBbUM7QUFDbkMsZ0VBQXNDO0FBQ3RDLHVEQUE2QjtBQUM3QixtRUFBeUM7QUFDekMsZ0VBQXNDO0FBRXRDLE1BQWEsUUFBUTtJQWNwQixzQ0FBc0M7SUFDdEMsWUFDQyxJQUFXLEVBQ1gsT0FBZ0IsRUFDaEIsT0FBZSxFQUNmLFVBQXNCLEVBQ3RCLE1BQWU7O1FBZGhCLGVBQVUsR0FBYSxFQUFFLENBQUM7UUFJMUIsZ0JBQVcsR0FBRztZQUNiLE9BQU8sRUFBRSxDQUFPLElBQWMsRUFBRSxFQUFFLHdEQUFDLE9BQUEsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUEsR0FBQTtTQUNqRSxDQUFDO1FBa0RGLHNCQUFpQixHQUFHLENBQU8sSUFBYSxFQUFFLEVBQUUsd0RBQUMsT0FBQSwwQ0FBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUEsR0FBQSxDQUFDO1FBQzFFLGtCQUFhLEdBQUcsQ0FBTyxJQUEyQixFQUFFLEVBQUUsd0RBQUMsT0FBQSxpQ0FBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQSxHQUFBLENBQUM7UUFFaEYsZ0JBQVcsR0FBRyxDQUFP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