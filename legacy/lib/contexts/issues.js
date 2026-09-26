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
    static async parse(utils, config, context) {
        const payload = context.payload;
        const issue = payload.issue;
        if (!issue) {
            return;
        }
        (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, 'context.payload.issue: ' + JSON.stringify(context.payload.issue));
        const labels = await utils.parsingData
            .labels(issue.labels)
            .catch(async (error) => {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while parsing labels: ' + String(error)));
        });
        let currentVersion;
        if (config.versioning) {
            currentVersion = await utils.versioning
                .parse(config, config.issue?.ref)
                .catch(async (error) => {
                throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while parsing versioning: ' + String(error)));
            });
        }
        return {
            ...context,
            currentVersion,
            // Todo: ask for advice on how to resolve
            // @ts-expect-error due to the range of possible types, it throws an error even though its fully populated
            props: {
                type: 'issue',
                ...issue,
                labels,
            },
        };
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
    async run(attempt) {
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
                (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, 'Starting enforce conventions');
                await this.conventions.enforce(this);
            }
            if (this.config.labels) {
                (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, 'Starting to label issue');
                await this.applyLabels(this).catch(error => {
                    throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error applying label' + String(error)));
                });
            }
            if (this.config.assignProject) {
                (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, 'Starting assisgn project');
                await this.assignProject(this).catch(async (error) => {
                    throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error assigning projects' + String(error)));
                });
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
            setTimeout(async () => {
                await this.run(attempt);
            }, seconds * 1000);
        }
    }
}
exports.Issues = Issues;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNzdWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbnRleHRzL2lzc3Vlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHOzs7O0FBRUgsNERBQXNDO0FBR3RDLDhDQUFpRDtBQUlqRCxpREFBNEM7QUFrQjVDLE1BQWEsTUFBTyxTQUFRLG1CQUFRO0lBQ25DOzs7O09BSUc7SUFDSCxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FDakIsS0FBWSxFQUNaLE1BQWMsRUFDZCxPQUFnQjtRQUVoQixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBMEMsQ0FBQztRQUNuRSxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO1FBQzVCLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDWCxPQUFPO1NBQ1A7UUFFRCxJQUFBLGdCQUFHLEVBQ0YsMEJBQWEsQ0FBQyxLQUFLLEVBQ25CLHlCQUF5QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FDakUsQ0FBQztRQUVGLE1BQU0sTUFBTSxHQUFHLE1BQU0sS0FBSyxDQUFDLFdBQVc7YUFDcEMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7YUFDcEIsS0FBSyxDQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsRUFBRTtZQUNwQixNQUFNLElBQUksS0FBSyxDQUFDLElBQUEsZ0JBQUcsRUFBQywwQkFBYSxDQUFDLEtBQUssRUFBRSxxQ0FBcUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xHLENBQUMsQ0FBQyxDQUFDO1FBRUosSUFBSSxjQUFtQyxDQUFDO1FBQ3hDLElBQUksTUFBTSxDQUFDLFVBQVUsRUFBRTtZQUN0QixjQUFjLEdBQUcsTUFBTSxLQUFLLENBQUMsVUFBVTtpQkFDckMsS0FBSyxDQUFD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