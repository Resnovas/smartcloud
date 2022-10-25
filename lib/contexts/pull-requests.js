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
import * as core from '@actions/core';
import { log, LoggingLevels } from '../logging.js';
import { Contexts } from './methods/index.js';
/**
 * The pull request class.
 */
export class PullRequests extends Contexts {
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
        log(LoggingLevels.debug, 'context.payload.pull_request: '
            + JSON.stringify(context.payload.pull_request));
        const idNumber = pr.number;
        const labels = await utils.parsingData.labels(pr.labels).catch(async (error) => {
            throw new Error(log(LoggingLevels.error, 'Error thrown while parsing labels: ' + String(error)));
        });
        const files = await utils.api.files
            .list(idNumber)
            .catch(async (error) => {
            throw new Error(log(LoggingLevels.error, 'Error thrown while listing files: ' + String(error)));
        });
        const changes = await utils.api.pullRequests
            .changes(pr.additions, pr.deletions)
            .catch(async (error) => {
            throw new Error(log(LoggingLevels.error, 'Error thrown while handling changes: ' + String(error)));
        });
        const reviews = await utils.api.pullRequests.reviews
            .list(idNumber)
            .catch(async (error) => {
            throw new Error(log(LoggingLevels.error, 'Error thrown while handling reviews: ' + String(error)));
        });
        const pendingReview = await utils.api.pullRequests.reviews
            .pending(reviews.length, pr.requested_reviewers.length)
            .catch(async (error) => {
            throw new Error(log(LoggingLevels.error, 'Error thrown while handling reviews: ' + String(error)));
        });
        const requestedChanges = await utils.api.pullRequests.reviews
            .requestedChanges(reviews)
            .catch(async (error) => {
            throw new Error(log(LoggingLevels.error, 'Error thrown while handling reviews: ' + String(error)));
        });
        const approved = await utils.api.pullRequests.reviews
            .isApproved(reviews)
            .catch(async (error) => {
            throw new Error(log(LoggingLevels.error, 'Error thrown while handling reviews: ' + String(error)));
        });
        let currentVersion;
        if (config.versioning) {
            currentVersion = await utils.versioning
                .parse(config, config.issue?.ref)
                .catch(async (error) => {
                throw new Error(log(LoggingLevels.error, 'Error thrown while parsing versioning: ' + String(error)));
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
    context;
    config;
    // eslint-disable-next-line max-params
    constructor(util, runners, configs, curContext, dryRun) {
        if (curContext.type !== 'pr') {
            throw new Error(log(LoggingLevels.error, 'Cannot construct without pr context'));
        }
        super(util, runners, configs, curContext, dryRun);
        this.context = curContext.context;
        if (!configs.pr) {
            throw new Error(log(LoggingLevels.error, 'Cannot start without config'));
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
                    throw new Error(log(LoggingLevels.error, 'Error applying labels ' + String(error)));
                });
            }
            if (this.config.assignProject) {
                await this.assignProject(this).catch(async (error) => {
                    throw new Error(log(LoggingLevels.error, 'Error assigning projects ' + String(error)));
                });
            }
            if (this.config.automaticApprove) {
                await this.automaticApprove(this).catch(async (error) => {
                    throw new Error(log(LoggingLevels.error, 'Error approving ' + String(error)));
                });
            }
            if (this.config.requestApprovals) {
                await this.requestApprovals(this).catch(async (error) => {
                    throw new Error(log(LoggingLevels.error, 'Error requesting approval ' + String(error)));
                });
            }
            if (this.config.manageRelease) {
                await this.bumpVersion(this).catch(async (error) => {
                    throw new Error(log(LoggingLevels.error, 'Error managing release ' + String(error)));
                });
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
                throw new Error(log(LoggingLevels.emergency, 'Pull Request actions failed. Terminating job.'));
            }
            log(LoggingLevels.warn, `Pull Request Actions failed with "${String(error)}", retrying in ${seconds} seconds....`);
            attempt++;
            setTimeout(async () => {
                this.newVersion = await this.util.versioning.parse(this.runnerConfigs, this.config?.ref ?? this.context.ref);
                await this.run(attempt);
            }, seconds * 1000);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC1yZXF1ZXN0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250ZXh0cy9wdWxsLXJlcXVlc3RzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNDRztBQUVILE9BQU8sS0FBSyxJQUFJLE1BQU0sZUFBZSxDQUFDO0FBR3RDLE9BQU8sRUFBQyxHQUFHLEVBQUUsYUFBYSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBSWpELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQWlDNUM7O0dBRUc7QUFDSCxNQUFNLE9BQU8sWUFBYSxTQUFRLFFBQVE7SUFDekM7Ozs7T0FJRztJQUNILE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUNqQixLQUFZLEVBQ1osTUFBYyxFQUNkLE9BQWdCO1FBRWhCLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUEyQixDQUFDO1FBQ3BELE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUM7UUFDaEMsSUFBSSxDQUFDLEVBQUUsRUFBRTtZQUNSLE9BQU87U0FDUDtRQUVELEdBQUcsQ0FDRixhQUFhLENBQUMsS0FBSyxFQUNuQixnQ0FBZ0M7Y0FDOUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUM5QyxDQUFDO1FBRUYsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztRQUUzQixNQUFNLE1BQU0sR0FBRyxNQUFNLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxFQUFFO1lBQzVFLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUscUNBQXFDLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FB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