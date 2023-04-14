"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: issues.ts
 * Path: \src\contexts\issues.ts
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
exports.Issues = void 0;
const tslib_1 = require("tslib");
const core = tslib_1.__importStar(require("@actions/core"));
const logging_js_1 = require("../logging.js");
const index_js_1 = require("./methods/index.js");
class Issues extends index_js_1.Contexts {
    /**
     * Parse the Issue Context
     * @author IvanFon, TGTGamer, jbinda
     * @since 1.0.0
     */
    static parse(utils, config, context) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const payload = context.payload;
            const issue = payload.issue;
            if (!issue) {
                return;
            }
            (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, 'context.payload.issue: ' + JSON.stringify(context.payload.issue));
            const labels = yield utils.parsingData
                .labels(issue.labels)
                .catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while parsing labels: ' + String(error)));
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
                props: Object.assign(Object.assign({ type: 'issue' }, issue), { labels }) });
        });
    }
    // eslint-disable-next-line max-params
    constructor(util, runners, configs, curContext, dryRun) {
        if (curContext.type !== 'issue') {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Cannot construct without issue context'));
        }
        super(util, runners, configs, curContext, dryRun);
        this.context = curContext.context;
        if (!configs.issue) {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Cannot start without config'));
        }
        this.config = configs.issue;
    }
    run(attempt) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.config) {
                (0, logging_js_1.log)(logging_js_1.LoggingLevels.warn, 'Cannot start without config');
            }
            if (!attempt) {
                attempt = 1;
                core.startGroup('Issue Actions');
            }
            const seconds = attempt * 10;
            try {
                if (this.config.enforceConventions) {
                    yield this.conventions.enforce(this);
                }
                if (this.config.labels) {
                    yield this.applyLabels(this).catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error applying label' + String(error)));
                    }));
                }
                if (this.config.assignProject) {
                    yield this.assignProject(this).catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error assigning projects' + String(error)));
                    }));
                }
                core.endGroup();
            }
            catch (error) {
                if (attempt > this.retryLimit) {
                    core.endGroup();
                    throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.emergency, 'Issue actions failed. Terminating job.'));
                }
                (0, logging_js_1.log)(logging_js_1.LoggingLevels.warn, `Issue Actions failed with "${String(error)}", retrying in ${seconds} seconds....`);
                attempt++;
                setTimeout(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield this.run(attempt);
                }), seconds * 1000);
            }
        });
    }
}
exports.Issues = Issues;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNzdWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbnRleHRzL2lzc3Vlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHOzs7O0FBRUgsNERBQXNDO0FBR3RDLDhDQUFpRDtBQUlqRCxpREFBNEM7QUFrQjVDLE1BQWEsTUFBTyxTQUFRLG1CQUFRO0lBQ25DOzs7O09BSUc7SUFDSCxNQUFNLENBQU8sS0FBSyxDQUNqQixLQUFZLEVBQ1osTUFBYyxFQUNkLE9BQWdCOzs7WUFFaEIsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQTBDLENBQUM7WUFDbkUsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztZQUM1QixJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNYLE9BQU87YUFDUDtZQUVELElBQUEsZ0JBQUcsRUFDRiwwQkFBYSxDQUFDLEtBQUssRUFDbkIseUJBQXlCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUNqRSxDQUFDO1lBRUYsTUFBTSxNQUFNLEdBQUcsTUFBTSxLQUFLLENBQUMsV0FBVztpQkFDcEMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7aUJBQ3BCLEtBQUssQ0FBQyxDQUFNLEtBQUssRUFBQyxFQUFFO2dCQUNwQixNQUFNLElBQUksS0FBSyxDQUFDLElBQUEsZ0JBQUcsRUFBQywwQkFBYSxDQUFDLEtBQUssRUFBRSxxQ0FBcUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xHLENBQUMsQ0FBQSxDQUFDLENBQUM7WUFFSixJQUFJLGNBQW1DLENBQUM7WUFDeEMsSUFBSSxNQUFNLENBQUMsVUFBVSxFQUFFO2dCQUN0QixjQUFjLEdBQUcsTUFBTSxLQUFLLENBQUMsVUFBVTtxQkFDckMsS0FBSyxDQUFDLE1B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