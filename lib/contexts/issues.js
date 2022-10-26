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
                await this.conventions.enforce(this);
            }
            if (this.config.labels) {
                await this.applyLabels(this).catch(async (error) => {
                    throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error applying label' + String(error)));
                });
            }
            if (this.config.assignProject) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNzdWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbnRleHRzL2lzc3Vlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHOzs7O0FBRUgsNERBQXNDO0FBR3RDLDhDQUFpRDtBQUlqRCxpREFBNEM7QUFrQjVDLE1BQWEsTUFBTyxTQUFRLG1CQUFRO0lBeURuQyxzQ0FBc0M7SUFDdEMsWUFDQyxJQUFXLEVBQ1gsT0FBZ0IsRUFDaEIsT0FBZSxFQUNmLFVBQXNCLEVBQ3RCLE1BQWU7UUFFZixJQUFJLFVBQVUsQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFFO1lBQ2hDLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBQSxnQkFBRyxFQUNsQiwwQkFBYSxDQUFDLEtBQUssRUFDbkIsd0NBQXdDLENBQ3hDLENBQUMsQ0FBQztTQUNIO1FBRUQsS0FBSyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUM7UUFDbEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUU7WUFDbkIsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFBLGdCQUFHLEVBQ2xCLDBCQUFhLENBQUMsS0FBSyxFQUNuQiw2QkFBNkIsQ0FDN0IsQ0FBQyxDQUFDO1NBQ0g7UUFFRCxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7SUFDN0IsQ0FBQztJQWpGRDs7OztPQUlHO0lBQ0gsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQ2pCLEtBQVksRUFDWixNQUFjLEVBQ2QsT0FBZ0I7UUFFaEIsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQTBDLENBQUM7UUFDbkUsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztRQUM1QixJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1gsT0FBTztTQUNQO1FBRUQsSUFBQSxnQkFBRyxFQUNGLDBCQUFhLENBQUMsS0FBSyxFQUNuQix5QkFBeUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQ2pFLENBQUM7UUFFRixNQUFNLE1BQU0sR0FBRyxNQUFNLEtBQUssQ0FBQyxXQUFXO2FBQ3BDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO2FBQ3BCLEtBQUssQ0FBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEVBQUU7WUFDcEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFBLGdCQUFHLEVBQUMsMEJBQWEsQ0FBQyxLQUFLLEVBQUUscUNBQXFDLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRyxDQUFDLENBQUMsQ0FBQztRQUVKLElBQUksY0FBbUMsQ0FBQztRQUN4QyxJQUFJLE1BQU0sQ0FBQyxVQUFVLEVBQUU7WUFDdEIsY0FBYyxHQUFHLE1BQU0sS0FBSyxDQUFDLFVBQVU7aUJBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUM7aUJBQ2hDLEtBQUssQ0FBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEVBQUU7Z0JBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBQSxnQkFBRyxFQUNsQiwwQkFBYSxDQUFDLEtBQUssRUFDbkIseUNBQXlDLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUN6RCxDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztTQUNKO1FBRUQsT0FBTztZQUNOLEdBQUcsT0FBTztZQUNWLGNBQWM7WUFFZCx5Q0FBeUM7WUFDekMsMEdBQTBHO1lBQzFHLEtBQUssRUFBRTtnQkFDTixJQUFJLEVBQUUsT0FBTztnQkFDYixHQUFHLEtBQUs7Z0JBQ1IsTUFBTTthQUNOO1NBQ0QsQ0FBQztJQUNILENBQUM7SUFnQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFnQjtRQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNqQixJQUFBLGdCQUFHLEVBQ0YsMEJBQWEsQ0FBQyxJQUFJLEVBQ2xCLDZCQUE2QixDQUM3QixDQUFDO1NBQ0Y7UUFFRCxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2IsT0FBTyxHQUFHLENBQUMsQ0FBQztZQUNaLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUM7U0FDakM7UUFFRCxNQUFNLE9BQU8sR0FBRyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQzdCLElBQUk7WUFDSCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEVBQUU7Z0JBQ25DLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDckM7WUFFRCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO2dCQUN2QixNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsRUFBRTtvQkFDaEQsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFBLGdCQUFHLEVBQUMsMEJBQWEsQ0FBQyxLQUFLLEVBQUUsc0JBQXNCLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkYsQ0FBQyxDQUFDLENBQUM7YUFDSDtZQUVELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUU7Z0JBQzlCLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxFQUFFO29CQUNsRCxNQUFNLElBQUksS0FBSyxDQUFDLElBQUEsZ0JBQUcsRUFBQywwQkFBYSxDQUFDLEtBQUssRUFBRSwwQkFBMEIsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2RixDQUFDLENBQUMsQ0FBQzthQUNIO1lBRUQsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQ2hCO1FBQUMsT0FBTyxLQUFjLEVBQUU7WUFDeEIsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDOUIsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNoQixNQUFNLElBQUksS0FBSyxDQUFDLElBQUEsZ0JBQUcsRUFDbEIsMEJBQWEsQ0FBQyxTQUFTLEVBQ3ZCLHdDQUF3QyxDQUN4QyxDQUFDLENBQUM7YUFDSDtZQUVELElBQUEsZ0JBQUcsRUFDRiwwQkFBYSxDQUFDLElBQUksRUFDbEIsOEJBQThCLE1BQU0sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLE9BQU8sY0FBYyxDQUNsRixDQUFDO1lBQ0YsT0FBTyxFQUFFLENBQUM7WUFDVixVQUFVLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQ3JCLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN6QixDQUFDLEVBQUUsT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDO1NBQ25CO0lBQ0YsQ0FBQztDQUNEO0FBdklELHdCQXVJQyJ9