/*
 * Project: @resnovas/smartcloud
 * File: projects.ts
 * Path: \src\contexts\projects.ts
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
export class Project extends Contexts {
    /**
     * Parse the Project Context
     * @author IvanFon, TGTGamer, jbinda
     * @since 1.0.0
     */
    static async parse(utils, config, context) {
        const payload = context.payload;
        const project = payload.project_card;
        if (!project) {
            return;
        }
        log(LoggingLevels.debug, `context.payload.project_card: ${JSON.stringify(context.payload.project_card)}`);
        if (!project.content_url) {
            throw new Error('No content information to get');
        }
        const issueNumber = project.id;
        const issue = await utils.api.issues.get(issueNumber);
        const labels = await utils.parsingData
            .labels(issue.labels)
            .catch(async (error) => {
            throw new Error(log(LoggingLevels.error, 'Error thrown while parsing labels: ' + String(error)));
        });
        let currentVersion;
        if (config.versioning) {
            currentVersion = await utils.versioning
                .parse(config, config.issue?.ref)
                .catch(async (error) => {
                throw new Error(log(LoggingLevels.error, 'Error thrown while parsing versioning: ' + String(error)));
            });
        }
        const localProject = await utils.api.project.projects.get(project.id);
        const localColumn = await utils.api.project.column.get(project.column_id);
        const localCard = await utils.api.project.card.get(project.id);
        return {
            ...context,
            currentVersion,
            // Todo: ask for advice on how to resolve
            // @ts-expect-error due to the range of possible types, it throws an error even though its fully populated
            props: {
                type: 'project',
                ...project,
                project: localProject,
                localColumn,
                localCard,
                labels,
            },
        };
    }
    context;
    config;
    // eslint-disable-next-line max-params
    constructor(util, runners, configs, curContext, dryRun) {
        if (curContext.type !== 'project') {
            throw new Error(log(LoggingLevels.error, 'Cannot construct without project context'));
        }
        super(util, runners, configs, curContext, dryRun);
        this.context = curContext.context;
        if (!configs.project) {
            throw new Error(log(LoggingLevels.error, 'Cannot start without config'));
        }
        this.config = configs.project;
    }
    async run(attempt) {
        if (!this.config) {
            throw new Error(log(LoggingLevels.error, 'Cannot start without config'));
        }
        if (!attempt) {
            attempt = 1;
            core.startGroup('project Actions');
        }
        if (!attempt) {
            attempt = 1;
            core.startGroup('project Actions');
        }
        const seconds = attempt * 10;
        try {
            if (this.config.enforceConventions) {
                if (!this.config.enforceConventions.onColumn) {
                    return;
                }
                this.config.enforceConventions.onColumn
                    = await this.convertColumnStringsToIdArray(this.config.enforceConventions.onColumn);
                if (this.config.enforceConventions?.onColumn?.includes(this.context.props.column_id)) {
                    await this.conventions.enforce(this);
                }
            }
            if (this.config.labels) {
                await this.applyLabels(this).catch(async (error) => {
                    throw new Error(log(LoggingLevels.error, 'Error applying labels' + String(error)));
                });
            }
            // If (this.config.syncRemote && this.util.shouldRun("release"))
            // 	await this.syncRemoteProject(this).catch((err) => {
            // 		await log(LoggingLevels.error, "Error syncing remote project"+ err)
            // 	})
            core.endGroup();
        }
        catch (error) {
            if (attempt > this.retryLimit) {
                core.endGroup();
                throw new Error(log(LoggingLevels.emergency, 'project actions failed. Terminating job.'));
            }
            log(LoggingLevels.warn, `project Actions failed with "${String(error)}", retrying in ${seconds} seconds....`);
            attempt++;
            setTimeout(async () => {
                await this.run(attempt);
            }, seconds * 1000);
        }
    }
    async convertColumnStringsToIdArray(columns) {
        const columnList = await this.util.api.project.column.list(this.context.props.project.id);
        return columns.map(column => {
            if (typeof column === 'string') {
                let columnId;
                for (const value of columnList) {
                    if (value.name.toLowerCase() === column.toLowerCase()) {
                        columnId = value.id;
                    }
                }
                if (!columnId) {
                    throw new Error(log(LoggingLevels.error, `${column} doesn't exist on this project`));
                }
                return columnId;
            }
            return column;
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvamVjdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29udGV4dHMvcHJvamVjdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHO0FBRUgsT0FBTyxLQUFLLElBQUksTUFBTSxlQUFlLENBQUM7QUFNdEMsT0FBTyxFQUFDLEdBQUcsRUFBRSxhQUFhLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDakQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBd0I1QyxNQUFNLE9BQU8sT0FBUSxTQUFRLFFBQVE7SUFDcEM7Ozs7T0FJRztJQUNILE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUNqQixLQUFZLEVBQ1osTUFBYyxFQUNkLE9BQWdCO1FBRWhCLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUEyQixDQUFDO1FBQ3BELE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUM7UUFDckMsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNiLE9BQU87U0FDUDtRQUVELEdBQUcsQ0FDRixhQUFhLENBQUMsS0FBSyxFQUNuQixpQ0FBaUMsSUFBSSxDQUFDLFNBQVMsQ0FDOUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQzVCLEVBQUUsQ0FDSCxDQUFDO1FBRUYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUU7WUFDekIsTUFBTSxJQUFJLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1NBQ2pEO1FBRUQsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUMvQixNQUFNLEtBQUssR0FBRyxNQUFNLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUV0RCxNQUFNLE1BQU0sR0FBRyxNQUFNLEtBQUssQ0FBQyxXQUFXO2FBQ3BDLE1BQU0sQ0FBQyxL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