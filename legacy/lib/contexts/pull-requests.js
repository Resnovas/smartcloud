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
    static async parse(utils, config, context) {
        const payload = context.payload;
        const pr = payload.pull_request;
        if (!pr) {
            return;
        }
        (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, 'context.payload.pull_request: '
            + JSON.stringify(context.payload.pull_request));
        const idNumber = pr.number;
        const labels = await utils.parsingData.labels(pr.labels).catch(async (error) => {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while parsing labels: ' + String(error)));
        });
        const files = await utils.api.files
            .list(idNumber)
            .catch(async (error) => {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while listing files: ' + String(error)));
        });
        const changes = await utils.api.pullRequests
            .changes(pr.additions, pr.deletions)
            .catch(async (error) => {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while handling changes: ' + String(error)));
        });
        const reviews = await utils.api.pullRequests.reviews
            .list(idNumber)
            .catch(async (error) => {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while handling reviews: ' + String(error)));
        });
        const pendingReview = await utils.api.pullRequests.reviews
            .pending(reviews.length, pr.requested_reviewers.length)
            .catch(async (error) => {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while handling reviews: ' + String(error)));
        });
        const requestedChanges = await utils.api.pullRequests.reviews
            .requestedChanges(reviews)
            .catch(async (error) => {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while handling reviews: ' + String(error)));
        });
        const approved = await utils.api.pullRequests.reviews
            .isApproved(reviews)
            .catch(async (error) => {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while handling reviews: ' + String(error)));
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
                ...pr,
                type: 'pr',
                files,
                changes,
                reviews,
                pendingReview,
                requestedChanges,
                approved,
                labels,
            },
        };
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
    async run(attempt) {
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
                await this.conventions.enforce(this);
            }
            if (this.config.labels) {
                await this.applyLabels(this).catch(async (error) => {
                    throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error applying labels ' + String(error)));
                });
            }
            if (this.config.assignProject) {
                await this.assignProject(this).catch(async (error) => {
                    throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error assigning projects ' + String(error)));
                });
            }
            if (this.config.automaticApprove) {
                await this.automaticApprove(this).catch(async (error) => {
                    throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error approving ' + String(error)));
                });
            }
            if (this.config.requestApprovals) {
                await this.requestApprovals(this).catch(async (error) => {
                    throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error requesting approval ' + String(error)));
                });
            }
            // If (this.config.manageRelease) {
            // 	await this.bumpVersion(this).catch(async error => {
            // 		throw new Error(log(LoggingLevels.error, 'Error managing release ' + String(error)));
            // 	});
            // }
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
            setTimeout(async () => {
                this.newVersion = await this.util.versioning.parse(this.runnerConfigs, this.config?.ref ?? this.context.ref);
                await this.run(attempt);
            }, seconds * 1000);
        }
    }
}
exports.PullRequests = PullRequests;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC1yZXF1ZXN0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250ZXh0cy9wdWxsLXJlcXVlc3RzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQ0c7Ozs7QUFFSCw0REFBc0M7QUFHdEMsOENBQWlEO0FBSWpELGlEQUE0QztBQWlDNUM7O0dBRUc7QUFDSCxNQUFhLFlBQWEsU0FBUSxtQkFBUTtJQUN6Qzs7OztPQUlHO0lBQ0gsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQ2pCLEtBQVksRUFDWixNQUFjLEVBQ2QsT0FBZ0I7UUFFaEIsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQTJCLENBQUM7UUFDcEQsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQztRQUNoQyxJQUFJLENBQUMsRUFBRSxFQUFFO1lBQ1IsT0FBTztTQUNQO1FBRUQsSUFBQSxnQkFBRyxFQUNGLDBCQUFhLENBQUMsS0FBSyxFQUNuQixnQ0FBZ0M7Y0FDOUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUM5QyxDQUFDO1FBRUYsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztRQUUzQixNQUFNLE1BQU0sR0FBRyxNQUFNLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxFQUFFO1lBQzVFLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBQSxnQkFBRyxFQUFDLDBCQUFhLENBQUMsS0FBSyxFQUFFLHFDQUFxQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEcsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLEtBQUssR0FBYSxNQUFNLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSzthQUMzQyxJQUFJLENBQUMsUUFBUSxDQUFDO2FBQ2QsS0FBSyxDQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsRUFBRTtZQUNwQixNQUFNLElBQUksS0FBSyxDQUFDLElBQUEsZ0JBQUcsRUFBQywwQkFBYSxDQUFDLEtBQUssRUFBRSxvQ0FBb0MsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pHLENBQUMsQ0FBQyxDQUFDO1FBRUosTUFBTSxPQUFPLEdBQVcsTUFBTSxLQUFLLENBQUMsR0FBRyxDQUFDLFlBQVk7YUFDbEQsT0FBTyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQzthQUNuQyxLQUFLLENBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxFQUFFO1lBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBQSxnQkFBRyxFQUNsQiwwQkFBYSxDQUFDLEtBQUssRUFDbkIsdUNBQXVDLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUN2RCxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVKLE1BQU0sT0FBTyxHQUFZLE1BQU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTzthQUMzRCxJQUFJLENBQUMsUUFBUSxDQUFDO2FBQ2QsS0FBSyxDQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsRUFBRTtZQUNwQixNQUFNLElBQUksS0FBSyxDQUFDLElBQUEsZ0JBQUcsRUFDbEIsMEJBQWEsQ0FBQyxLQUFLLEVBQ25CLHVDQUF1QyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FDdkQsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSixNQUFNLGFBQWEsR0FBWSxNQUFNLEtBQUssQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU87YUFDakUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQzthQUN0RCxLQUFLLENBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxFQUFFO1lBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBQSxnQkFBRyxFQUNsQiwwQkFBYSxDQUFDLEtBQUssRUFDbkIsdUNBQXVDLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUN2RCxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVKLE1BQU0sZ0JBQWdCLEdBQVcsTUFBTSxLQUFLLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPO2FBQ25FLGdCQUFnQixDQUFDLE9BQU8sQ0FBQzthQUN6QixLQUFLLENBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxFQUFFO1lBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBQSxnQkFBRyxFQUNsQiwwQkFBYSxDQUFDLEtBQUssRUFDbkIsdUNBQXVDLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUN2RCxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVKLE1BQU0sUUFBUSxHQUFXLE1BQU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTzthQUMzRCxVQUFVLENBQUMsT0FBTyxDQUFDO2FBQ25CLEtBQUssQ0FBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEVBQUU7WUFDcEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFBLGdCQUFHLEVBQ2xCLDBCQUFhLENBQUMsS0FBSyxFQUNuQix1Q0FBdUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQ3ZELENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUosSUFBSSxjQUFtQyxDQUFDO1FBQ3hDLElBQUksTUFBTSxDQUFDLFVBQVUsRUFBRTtZQUN0QixjQUFjLEdBQUcsTUFBTSxLQUFLLENBQUMsVUFBVTtpQkFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztpQkFDaEMsS0FBSyxDQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsRUFBRTtnQkFDcEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFBLGdCQUFHLEVBQ2xCLDBCQUFhLENBQUMsS0FBSyxFQUNuQix5Q0FBeUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQ3pELENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDO1NBQ0o7UUFFRCxPQUFPO1lBQ04sR0FBRyxPQUFPO1lBQ1YsY0FBYztZQUVkLHlDQUF5QztZQUN6QywwR0FBMEc7WUFDMUcsS0FBSyxFQUFFO2dCQUNOLEdBQUcsRUFBRTtnQkFDTCxJQUFJLEVBQUUsSUFBSTtnQkFDVixLQUFLO2dCQUNMLE9BQU87Z0JBQ1AsT0FBTztnQkFDUCxhQUFhO2dCQUNiLGdCQUFnQjtnQkFDaEIsUUFBUTtnQkFDUixNQUFNO2FBQ047U0FDRCxDQUFDO0lBQ0gsQ0FBQztJQUlELHNDQUFzQztJQUN0QyxZQUNDLElBQVcsRUFDWCxPQUFnQixFQUNoQixPQUFlLEVBQ2YsVUFBc0IsRUFDdEIsTUFBZTtRQUVmLElBQUksVUFBVSxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7WUFDN0IsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFBLGdCQUFHLEVBQ2xCLDBCQUFhLENBQUMsS0FBSyxFQUNuQixxQ0FBcUMsQ0FDckMsQ0FBQyxDQUFDO1NBQ0g7UUFFRCxLQUFLLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQztRQUNsQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRTtZQUNoQixNQUFNLElBQUksS0FBSyxDQUFDLElBQUEsZ0JBQUcsRUFDbEIsMEJBQWEsQ0FBQyxLQUFLLEVBQ25CLDZCQUE2QixDQUM3QixDQUFDLENBQUM7U0FDSDtRQUVELElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQztJQUMxQixDQUFDO0lBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFnQjtRQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNqQixNQUFNLElBQUksS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7U0FDL0M7UUFFRCxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2IsT0FBTyxHQUFHLENBQUMsQ0FBQztZQUNaLElBQUksQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsQ0FBQztTQUN4QztRQUVELE1BQU0sT0FBTyxHQUFHLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFFN0IsSUFBSTtZQUNILElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRTtnQkFDbkMsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNyQztZQUVELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7Z0JBQ3ZCLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxFQUFFO29CQUNoRCxNQUFNLElBQUksS0FBSyxDQUFDLElBQUEsZ0JBQUcsRUFBQywwQkFBYSxDQUFDLEtBQUssRUFBRSx3QkFBd0IsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNyRixDQUFDLENBQUMsQ0FBQzthQUNIO1lBRUQsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRTtnQkFDOUIsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEVBQUU7b0JBQ2xELE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBQSxnQkFBRyxFQUFDLDBCQUFhLENBQUMsS0FBSyxFQUFFLDJCQUEyQixHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hGLENBQUMsQ0FBQyxDQUFDO2FBQ0g7WUFFRCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQ2pDLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEVBQUU7b0JBQ3JELE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBQSxnQkFBRyxFQUFDLDBCQUFhLENBQUMsS0FBSyxFQUFFLGtCQUFrQixHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9FLENBQUMsQ0FBQyxDQUFDO2FBQ0g7WUFFRCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQ2pDLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEVBQUU7b0JBQ3JELE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBQSxnQkFBRyxFQUFDLDBCQUFhLENBQUMsS0FBSyxFQUFFLDRCQUE0QixHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pGLENBQUMsQ0FBQyxDQUFDO2FBQ0g7WUFFRCxtQ0FBbUM7WUFDbkMsdURBQXVEO1lBQ3ZELDBGQUEwRjtZQUMxRixPQUFPO1lBQ1AsSUFBSTtZQUVKLG1CQUFtQjtZQUNuQixpQkFBaUI7WUFDakIsMkJBQTJCO1lBQzNCLDhEQUE4RDtZQUM5RCxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDaEI7UUFBQyxPQUFPLEtBQWMsRUFBRTtZQUN4QixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUM5QixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBQSxnQkFBRyxFQUNsQiwwQkFBYSxDQUFDLFNBQVMsRUFDdkIsK0NBQStDLENBQy9DLENBQUMsQ0FBQzthQUNIO1lBRUQsSUFBQSxnQkFBRyxFQUNGLDBCQUFhLENBQUMsSUFBSSxFQUNsQixxQ0FBcUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsT0FBTyxjQUFjLENBQ3pGLENBQUM7WUFDRixPQUFPLEVBQUUsQ0FBQztZQUNWLFVBQVUsQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFDckIsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FDakQsSUFBSSxDQUFDLGFBQWEsRUFDbEIsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQ3BDLENBQUM7Z0JBQ0YsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3pCLENBQUMsRUFBRSxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUM7U0FDbkI7SUFDRixDQUFDO0NBQ0Q7QUF4TkQsb0NBd05DIn0=