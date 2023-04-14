"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: pull-requests.ts
 * Path: \src\contexts\pull-requests.ts
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
exports.PullRequests = void 0;
const tslib_1 = require("tslib");
const core = tslib_1.__importStar(require("@actions/core"));
const logging_js_1 = require("../logging.js");
const index_js_1 = require("./methods/index.js");
/**
 * The pull request class.
 */
class PullRequests extends index_js_1.Contexts {
    /**
     * Parse the PR Context
     * @author IvanFon, TGTGamer, jbinda
     * @since 1.0.0
     */
    static parse(utils, config, context) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const payload = context.payload;
            const pr = payload.pull_request;
            if (!pr) {
                return;
            }
            (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, 'context.payload.pull_request: '
                + JSON.stringify(context.payload.pull_request));
            const idNumber = pr.number;
            const labels = yield utils.parsingData.labels(pr.labels).catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while parsing labels: ' + String(error)));
            }));
            const files = yield utils.api.files
                .list(idNumber)
                .catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while listing files: ' + String(error)));
            }));
            const changes = yield utils.api.pullRequests
                .changes(pr.additions, pr.deletions)
                .catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while handling changes: ' + String(error)));
            }));
            const reviews = yield utils.api.pullRequests.reviews
                .list(idNumber)
                .catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while handling reviews: ' + String(error)));
            }));
            const pendingReview = yield utils.api.pullRequests.reviews
                .pending(reviews.length, pr.requested_reviewers.length)
                .catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while handling reviews: ' + String(error)));
            }));
            const requestedChanges = yield utils.api.pullRequests.reviews
                .requestedChanges(reviews)
                .catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while handling reviews: ' + String(error)));
            }));
            const approved = yield utils.api.pullRequests.reviews
                .isApproved(reviews)
                .catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while handling reviews: ' + String(error)));
            }));
            let currentVersion;
            if (config.versioning) {
                currentVersion = yield utils.versioning
                    .parse(config, (_a = config.issue) === null || _a === void 0 ? void 0 : _a.ref)
                    .catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while parsing versioning: ' + String(error)));
                }));
            }
            return Object.assign(Object.assign({}, context), { currentVersion, 
                // Todo: ask for advice on how to resolve
                // @ts-expect-error due to the range of possible types, it throws an error even though its fully populated
                props: Object.assign(Object.assign({}, pr), { type: 'pr', files,
                    changes,
                    reviews,
                    pendingReview,
                    requestedChanges,
                    approved,
                    labels }) });
        });
    }
    // eslint-disable-next-line max-params
    constructor(util, runners, configs, curContext, dryRun) {
        if (curContext.type !== 'pr') {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Cannot construct without pr context'));
        }
        super(util, runners, configs, curContext, dryRun);
        this.context = curContext.context;
        if (!configs.pr) {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Cannot start without config'));
        }
        this.config = configs.pr;
    }
    run(attempt) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.config) {
                throw new Error('Cannot start without config');
            }
            if (!attempt) {
                attempt = 1;
                core.startGroup('Pull Request Actions');
            }
            const seconds = attempt * 10;
            try {
                if (this.config.enforceConventions) {
                    yield this.conventions.enforce(this);
                }
                if (this.config.labels) {
                    yield this.applyLabels(this).catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error applying labels ' + String(error)));
                    }));
                }
                if (this.config.assignProject) {
                    yield this.assignProject(this).catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error assigning projects ' + String(error)));
                    }));
                }
                if (this.config.automaticApprove) {
                    yield this.automaticApprove(this).catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error approving ' + String(error)));
                    }));
                }
                if (this.config.requestApprovals) {
                    yield this.requestApprovals(this).catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error requesting approval ' + String(error)));
                    }));
                }
                if (this.config.manageRelease) {
                    yield this.bumpVersion(this).catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error managing release ' + String(error)));
                    }));
                }
                // Create changelog
                // create release
                // sync remote repositories
                // if (this.config.syncRemote) await this.syncRemoteRepo(this)
                core.endGroup();
            }
            catch (error) {
                if (attempt > this.retryLimit) {
                    core.endGroup();
                    throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.emergency, 'Pull Request actions failed. Terminating job.'));
                }
                (0, logging_js_1.log)(logging_js_1.LoggingLevels.warn, `Pull Request Actions failed with "${String(error)}", retrying in ${seconds} seconds....`);
                attempt++;
                setTimeout(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    var _a, _b;
                    this.newVersion = yield this.util.versioning.parse(this.runnerConfigs, (_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.ref) !== null && _b !== void 0 ? _b : this.context.ref);
                    yield this.run(attempt);
                }), seconds * 1000);
            }
        });
    }
}
exports.PullRequests = PullRequests;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC1yZXF1ZXN0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250ZXh0cy9wdWxsLXJlcXVlc3RzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQ0c7Ozs7QUFFSCw0REFBc0M7QUFHdEMsOENBQWlEO0FBSWpELGlEQUE0QztBQWlDNUM7O0dBRUc7QUFDSCxNQUFhLFlBQWEsU0FBUSxtQkFBUTtJQUN6Qzs7OztPQUlHO0lBQ0gsTUFBTSxDQUFPLEtBQUssQ0FDakIsS0FBWSxFQUNaLE1BQWMsRUFDZCxPQUFnQjs7O1lBRWhCLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUEyQixDQUFDO1lBQ3BELE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUM7WUFDaEMsSUFBSSxDQUFDLEVBQUUsRUFBRTtnQkFDUixPQUFPO2FBQ1A7WUFFRCxJQUFBLGdCQUFHLEVBQ0YsMEJBQWEsQ0FBQyxLQUFLLEVBQ25CLGdDQUFnQztrQkFDOUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUM5QyxDQUFDO1lBRUYsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztZQUUzQixNQUFNLE1BQU0sR0FBRyxNQUFNLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBTSxLQUFLLEVBQUMsRUFBRTtnQkFDNUUsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFBLGdCQUFHLEVBQUMsMEJBQWEsQ0FBQyxLQUFLLEVBQUUscUNBQXFDLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsRyxDQUFDLENBQUEsQ0FBQyxDQUFDO1lBRUgsTUFBTSxLQUFLLEdBQWEsTUFBTSxLQUFLLENBQUMsR0FBRyxDQUFD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