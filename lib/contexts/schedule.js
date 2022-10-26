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
    /**
     * Parse the Schedule Context
     * @author TGTGamer
     * @since 1.0.0
     */
    static async parse(context) {
        return {
            ...context,
            repo: context.repo,
            issue: context.issue,
            props: {
                type: 'schedule',
            },
        };
    }
    async run(attempt) {
        if (!this.config) {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.warn, 'Cannot start without config'));
        }
        if (!attempt) {
            attempt = 1;
            core.startGroup('Schedule Actions');
        }
        const seconds = attempt * 10;
        try {
            const issues = await this.util.api.issues.list({});
            // Todo: fix this for each loop
            // eslint-disable-next-line unicorn/no-array-for-each
            issues.forEach(async (issue) => {
                const labels = await this.util.parsingData
                    .labels(issue.labels)
                    .catch(async (error) => {
                    throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while parsing labels: ' + String(error)));
                });
                const context = {
                    ...this.ctx,
                    props: {
                        ...issue,
                        type: 'issue',
                        labels,
                    },
                };
                (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, `Testing issue: ${issue.id} - ${issue.title} - ${issue.html_url} - Last updated: ${issue.updated_at}`);
                if (this.config.stale) {
                    await this.checkStale(this, context, this.config).catch(async (error) => {
                        throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error checking stale:' + String(error)));
                    });
                }
                (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, `Should apply labels? \r\n\r\n\r\n\r\n ${JSON.stringify(this.config.labels)}`);
                if (this.config.labels) {
                    await this.applyLabels(this).catch(async (error) => {
                        throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error applying label:' + String(error)));
                    });
                }
            });
            core.endGroup();
        }
        catch (error) {
            if (attempt > this.retryLimit) {
                core.endGroup();
                throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.emergency, 'Scheduled actions failed. Terminating job.'));
            }
            (0, logging_js_1.log)(logging_js_1.LoggingLevels.warn, `Scheduled Actions failed with "${String(error)}", retrying in ${seconds} seconds....`);
            attempt++;
            setTimeout(async () => {
                await this.run(attempt);
            }, seconds * 1000);
        }
    }
}
exports.Schedule = Schedule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NoZWR1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29udGV4dHMvc2NoZWR1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNDRzs7OztBQUVILDREQUFzQztBQUV0Qyw4Q0FBaUQ7QUFJakQsaURBQTRDO0FBTzVDLE1BQWEsUUFBUyxTQUFRLG1CQUFRO0lBc0JyQyxzQ0FBc0M7SUFDdEMsWUFDQyxJQUFXLEVBQ1gsT0FBZ0IsRUFDaEIsT0FBZSxFQUNmLFVBQXNCLEVBQ3RCLE1BQWU7UUFFZixJQUFJLFVBQVUsQ0FBQyxJQUFJLEtBQUssVUFBVSxFQUFFO1lBQ25DLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBQSxnQkFBRyxFQUNsQiwwQkFBYSxDQUFDLEtBQUssRUFDbkIsMkNBQTJDLENBQzNDLENBQUMsQ0FBQztTQUNIO1FBRUQsS0FBSyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUM7UUFDbEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDO1FBQzlCLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFO1lBQ3RCLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBQSxnQkFBRyxFQUNsQiwwQkFBYSxDQUFDLEtBQUssRUFDbkIsNkJBQTZCLENBQzdCLENBQUMsQ0FBQztTQUNIO1FBRUQsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO0lBQ2hDLENBQUM7SUEvQ0Q7Ozs7T0FJRztJQUVILE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQWdCO1FBQ2xDLE9BQU87WUFDTixHQUFHLE9BQU87WUFDVixJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUk7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