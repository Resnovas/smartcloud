"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: schedule.ts
 * Path: \src\contexts\schedule.ts
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
 * Last Modified: 25-10-2022
 * By: Jonathan Stevens (Email: jonathan@resnovas.com, Github: https://github.com/TGTGamer)
 * Current Version: 1.0.0-beta.0
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schedule = void 0;
const tslib_1 = require("tslib");
const core = tslib_1.__importStar(require("@actions/core"));
const logging_js_1 = require("../logging.js");
const index_js_1 = require("./methods/index.js");
class Schedule extends index_js_1.Contexts {
    /**
     * Parse the Schedule Context
     * @author TGTGamer
     * @since 1.0.0
     */
    static parse(context) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return Object.assign(Object.assign({}, context), { repo: context.repo, issue: context.issue, props: {
                    type: 'schedule',
                } });
        });
    }
    // eslint-disable-next-line max-params
    constructor(util, runners, configs, curContext, dryRun) {
        if (curContext.type !== 'schedule') {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Cannot construct without schedule context'));
        }
        super(util, runners, configs, curContext, dryRun);
        this.context = curContext.context;
        this.ctx = curContext.context;
        if (!configs.schedule) {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Cannot start without config'));
        }
        this.config = configs.schedule;
    }
    run(attempt) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.config) {
                throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.warn, 'Cannot start without config'));
            }
            if (!attempt) {
                attempt = 1;
                core.startGroup('Schedule Actions');
            }
            const seconds = attempt * 10;
            try {
                const issues = yield this.util.api.issues.list({});
                // Todo: fix this for each loop
                // eslint-disable-next-line unicorn/no-array-for-each
                issues.forEach((issue) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const labels = yield this.util.parsingData
                        .labels(issue.labels)
                        .catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while parsing labels: ' + String(error)));
                    }));
                    const context = Object.assign(Object.assign({}, this.ctx), { props: Object.assign(Object.assign({}, issue), { type: 'issue', labels }) });
                    (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, `Testing issue: ${issue.id} - ${issue.title} - ${issue.html_url} - Last updated: ${issue.updated_at}`);
                    if (this.config.stale) {
                        yield this.checkStale(this, context, this.config).catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error checking stale:' + String(error)));
                        }));
                    }
                    (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, `Should apply labels? \r\n\r\n\r\n\r\n ${JSON.stringify(this.config.labels)}`);
                    if (this.config.labels) {
                        yield this.applyLabels(this).catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error applying label:' + String(error)));
                        }));
                    }
                }));
                core.endGroup();
            }
            catch (error) {
                if (attempt > this.retryLimit) {
                    core.endGroup();
                    throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.emergency, 'Scheduled actions failed. Terminating job.'));
                }
                (0, logging_js_1.log)(logging_js_1.LoggingLevels.warn, `Scheduled Actions failed with "${String(error)}", retrying in ${seconds} seconds....`);
                attempt++;
                setTimeout(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield this.run(attempt);
                }), seconds * 1000);
            }
        });
    }
}
exports.Schedule = Schedule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NoZWR1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29udGV4dHMvc2NoZWR1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNDRzs7OztBQUVILDREQUFzQztBQUV0Qyw4Q0FBaUQ7QUFJakQsaURBQTRDO0FBTzVDLE1BQWEsUUFBUyxTQUFRLG1CQUFRO0lBQ3JDOzs7O09BSUc7SUFFSCxNQUFNLENBQU8sS0FBSyxDQUFDLE9BQWdCOztZQUNsQyx1Q0FDSSxPQUFPLEtBQ1YsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQ2xCLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSyxFQUNwQixLQUFLLEVBQUU7b0JBQ04sSUFBSSxFQUFFLFVBQVU7aUJBQ2hCLElBQ0E7UUFDSCxDQUFDO0tBQUE7SUFNRCxzQ0FBc0M7SUFDdEMsWUFDQyxJQUFXLEVBQ1gsT0FBZ0IsRUFDaEIsT0FBZSxFQUNmLFVBQXNCLEVBQ3RCLE1BQWU7UUFFZixJQUFJLFVBQVUsQ0FBQyxJQUFJLEtBQUssVUFBVSxFQUFFO1lBQ25DLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBQSxnQkFBRyxFQUNsQiwwQkFBYSxDQUFDLEtBQUssRUFDbkIsMkNBQTJDLENBQzNDLENBQUMsQ0FBQztTQUNIO1FBRUQsS0FBSyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUM7UUFDbEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDO1FBQzlCLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFO1lBQ3RCLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBQSxnQkFBRyxFQUNsQiwwQkFBYSxDQUFDLEtBQUssRUFDbkIsNkJBQTZCLENB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