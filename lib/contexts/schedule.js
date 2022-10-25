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
import * as core from '@actions/core';
import { log, LoggingLevels } from '../logging.js';
import { Contexts } from './methods/index.js';
export class Schedule extends Contexts {
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
    context;
    ctx;
    config;
    // eslint-disable-next-line max-params
    constructor(util, runners, configs, curContext, dryRun) {
        if (curContext.type !== 'schedule') {
            throw new Error(log(LoggingLevels.error, 'Cannot construct without schedule context'));
        }
        super(util, runners, configs, curContext, dryRun);
        this.context = curContext.context;
        this.ctx = curContext.context;
        if (!configs.schedule) {
            throw new Error(log(LoggingLevels.error, 'Cannot start without config'));
        }
        this.config = configs.schedule;
    }
    async run(attempt) {
        if (!this.config) {
            throw new Error(log(LoggingLevels.warn, 'Cannot start without config'));
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
                    throw new Error(log(LoggingLevels.error, 'Error thrown while parsing labels: ' + String(error)));
                });
                const context = {
                    ...this.ctx,
                    props: {
                        ...issue,
                        type: 'issue',
                        labels,
                    },
                };
                log(LoggingLevels.debug, `Testing issue: ${issue.id} - ${issue.title} - ${issue.html_url} - Last updated: ${issue.updated_at}`);
                if (this.config.stale) {
                    await this.checkStale(this, context, this.config).catch(async (error) => {
                        throw new Error(log(LoggingLevels.error, 'Error checking stale:' + String(error)));
                    });
                }
                log(LoggingLevels.debug, `Should apply labels? \r\n\r\n\r\n\r\n ${JSON.stringify(this.config.labels)}`);
                if (this.config.labels) {
                    await this.applyLabels(this).catch(async (error) => {
                        throw new Error(log(LoggingLevels.error, 'Error applying label:' + String(error)));
                    });
                }
            });
            core.endGroup();
        }
        catch (error) {
            if (attempt > this.retryLimit) {
                core.endGroup();
                throw new Error(log(LoggingLevels.emergency, 'Scheduled actions failed. Terminating job.'));
            }
            log(LoggingLevels.warn, `Scheduled Actions failed with "${String(error)}", retrying in ${seconds} seconds....`);
            attempt++;
            setTimeout(async () => {
                await this.run(attempt);
            }, seconds * 1000);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NoZWR1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29udGV4dHMvc2NoZWR1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHO0FBRUgsT0FBTyxLQUFLLElBQUksTUFBTSxlQUFlLENBQUM7QUFFdEMsT0FBTyxFQUFDLEdBQUcsRUFBRSxhQUFhLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFJakQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBTzVDLE1BQU0sT0FBTyxRQUFTLFNBQVEsUUFBUTtJQUNyQzs7OztPQUlHO0lBRUgsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBZ0I7UUFDbEMsT0FBTztZQUNOLEdBQUcsT0FBTztZQUNWLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSTtZQUNsQixLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUs7WUFDcEIsS0FBSyxFQUFFO2dCQUNOLElBQUksRUFBRSxVQUFVO2FBQ2hCO1NBQ0QsQ0FBQztJQUNILENBQUM7SUFFRCxPQUFPLENBQWtCO0lBQ3pCLEdBQUcsQ0FBa0I7SUFDckIsTUFBTSxDQUFpQjtJQUV2QixzQ0FBc0M7SUFDdEMsWUFDQyxJQUFXLEVBQ1gsT0FBZ0IsRUFDaEIsT0FBZSxFQUNmLFVBQXNCLEVBQ3RCLE1BQWU7UUFFZixJQUFJLFVBQVUsQ0FBQyxJQUFJLEtBQUssVUFBVSxFQUFFO1lBQ25DLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxDQUNsQixhQUFhLENBQUMsS0FBSyxFQUNuQiwyQ0FBMkMsQ0FDM0MsQ0FBQyxDQUFDO1NBQ0g7UUFFRCxLQUFLLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQztRQUNs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