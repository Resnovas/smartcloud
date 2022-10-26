"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const tslib_1 = require("tslib");
const core = tslib_1.__importStar(require("@actions/core"));
const logging_js_1 = require("../logging.js");
const index_js_1 = require("./methods/index.js");
class Project extends index_js_1.Contexts {
    // eslint-disable-next-line max-params
    constructor(util, runners, configs, curContext, dryRun) {
        if (curContext.type !== 'project') {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Cannot construct without project context'));
        }
        super(util, runners, configs, curContext, dryRun);
        this.context = curContext.context;
        if (!configs.project) {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Cannot start without config'));
        }
        this.config = configs.project;
    }
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
        (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, `context.payload.project_card: ${JSON.stringify(context.payload.project_card)}`);
        if (!project.content_url) {
            throw new Error('No content information to get');
        }
        const issueNumber = project.id;
        const issue = await utils.api.issues.get(issueNumber);
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
    async run(attempt) {
        if (!this.config) {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Cannot start without config'));
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
                    throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error applying labels' + String(error)));
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
                throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.emergency, 'project actions failed. Terminating job.'));
            }
            (0, logging_js_1.log)(logging_js_1.LoggingLevels.warn, `project Actions failed with "${String(error)}", retrying in ${seconds} seconds....`);
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
                    throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, `${column} doesn't exist on this project`));
                }
                return columnId;
            }
            return column;
        });
    }
}
exports.Project = Project;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvamVjdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29udGV4dHMvcHJvamVjdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNDRzs7OztBQUVILDREQUFzQztBQU10Qyw4Q0FBaUQ7QUFDakQsaURBQTRDO0FBd0I1QyxNQUFhLE9BQVEsU0FBUSxtQkFBUTtJQTBFcEMsc0NBQXNDO0lBQ3RDLFlBQ0MsSUFBVyxFQUNYLE9BQWdCLEVBQ2hCLE9BQWUsRUFDZixVQUFzQixFQUN0QixNQUFlO1FBRWYsSUFBSSxVQUFVLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtZQUNsQyxNQUFNLElBQUksS0FBSyxDQUFDLElBQUEsZ0JBQUcsRUFDbEIsMEJBQWEsQ0FBQyxLQUFLLEVBQ25CLDBDQUEwQyxDQUMxQyxDQUFDLENBQUM7U0FDSDtRQUVELEtBQUssQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO1lBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBQSxnQkFBRyxFQUNsQiwwQkFBYSxDQUFDLEtBQUssRUFDbkIsNkJBQTZCLENBQzdCLENBQUMsQ0FBQztTQUNIO1FBRUQsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO0lBQy9CLENBQUM7SUFsR0Q7Ozs7T0FJRztJQUNILE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUNqQixLQUFZLEVBQ1osTUFBYyxFQUNkLE9BQWdCO1FBRWhCLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUEyQixDQUFDO1FBQ3BELE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUM7UUFDckMsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNiLE9BQU87U0FDUDtRQUVELElBQUEsZ0JBQUcsRUFDRiwwQkFBYSxDQUFDLEtBQUssRUFDbkIsaUNBQWlDLElBQUksQ0FBQyxTQUFTLENBQzlDLE9BQU8sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUM1QixFQUFFLENBQ0gsQ0FBQztRQUVGLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFO1lBQ3pCLE1BQU0sSUFBSSxLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQztTQUNqRDtRQUVELE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDL0IsTUFBTSxLQUFLLEdBQUcsTUFBTSxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFdEQsTUFBTSxNQUFNLEdBQUcsTUFBTSxLQUFLLENBQUMsV0FBVzthQUNwQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQzthQUNwQixLQUFLLENBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxFQUFFO1lBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBQSxnQkFBRyxFQUFDLDBCQUFhLENBQUMsS0FBSyxFQUFFLHFDQUFxQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEcsQ0FBQyxDQUFDLENBQUM7UUFFSixJQUFJLGNBQW1DLENBQUM7UUFDeEMsSUFBSSxNQUFNLENBQUMsVUFBVSxFQUFFO1lBQ3RCLGNBQWMsR0FBRyxNQUFNLEtBQUssQ0FBQyxVQUFVO2lCQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDO2lCQUNoQyxLQUFLLENBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxFQUFFO2dCQUNwQixNQUFNLElBQUksS0FBSyxDQUFDLElBQUEsZ0JBQUcsRUFDbEIsMEJBQWEsQ0FBQyxLQUFLLEVBQ25CLHlDQUF5QyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FDekQsQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDLENBQUM7U0FDSjtRQUVELE1BQU0sWUFBWSxHQUFHLE1BQU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFdEUsTUFBTSxXQUFXLEdBQUcsTUFBTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUUxRSxNQUFNLFNBQVMsR0FBRyxNQUFNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRS9ELE9BQU87WUFDTixHQUFHLE9BQU87WUFDVixjQUFjO1lBRWQseUNBQXlDO1lBQ3pDLDBHQUEwRztZQUMxRyxLQUFLLEVBQUU7Z0JBQ04sSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsR0FBRyxPQUFPO2dCQUNWLE9BQU8sRUFBRSxZQUFZO2dCQUNyQixXQUFXO2dCQUNYLFNBQVM7Z0JBQ1QsTUFBTTthQUNOO1NBQ0QsQ0FBQztJQUNILENBQUM7SUErQkQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFnQjtRQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNqQixNQUFNLElBQUksS0FBSyxDQUFDLElBQUEsZ0JBQUcsRUFDbEIsMEJBQWEsQ0FBQyxLQUFLLEVBQ25CLDZCQUE2QixDQUM3QixDQUFDLENBQUM7U0FDSDtRQUVELElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDYixPQUFPLEdBQUcsQ0FBQyxDQUFDO1lBQ1osSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1NBQ25DO1FBRUQsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNiLE9BQU8sR0FBRyxDQUFDLENBQUM7WUFDWixJQUFJLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLENBQUM7U0FDbkM7UUFFRCxNQUFNLE9BQU8sR0FBRyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBRTdCLElBQUk7WUFDSCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEVBQUU7Z0JBQ25DLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRTtvQkFDN0MsT0FBTztpQkFDUDtnQkFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFFBQVE7c0JBQ3BDLE1BQU0sSUFBSSxDQUFDLDZCQUE2QixDQUN6QyxJQUFJLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FDdkMsQ0FBQztnQkFDSCxJQUNDLElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FDakQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUM1QixFQUNBO29CQUNELE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ3JDO2FBQ0Q7WUFFRCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO2dCQUN2QixNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsRUFBRTtvQkFDaEQsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFBLGdCQUFHLEVBQUMsMEJBQWEsQ0FBQyxLQUFLLEVBQUUsdUJBQXVCLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEYsQ0FBQyxDQUFDLENBQUM7YUFDSDtZQUVELGdFQUFnRTtZQUNoRSx1REFBdUQ7WUFDdkQsd0VBQXdFO1lBQ3hFLE1BQU07WUFDTixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDaEI7UUFBQyxPQUFPLEtBQWMsRUFBRTtZQUN4QixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUM5QixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBQSxnQkFBRyxFQUNsQiwwQkFBYSxDQUFDLFNBQVMsRUFDdkIsMENBQTBDLENBQzFDLENBQUMsQ0FBQzthQUNIO1lBRUQsSUFBQSxnQkFBRyxFQUNGLDBCQUFhLENBQUMsSUFBSSxFQUNsQixnQ0FBZ0MsTUFBTSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsT0FBTyxjQUFjLENBQ3BGLENBQUM7WUFFRixPQUFPLEVBQUUsQ0FBQztZQUNWLFVBQVUsQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFDckIsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3pCLENBQUMsRUFBRSxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUM7U0FDbkI7SUFDRixDQUFDO0lBRUQsS0FBSyxDQUFDLDZCQUE2QixDQUFDLE9BQWlCO1FBQ3BELE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQ3pELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQzdCLENBQUM7UUFDRixPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDM0IsSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQUU7Z0JBQy9CLElBQUksUUFBNEIsQ0FBQztnQkFDakMsS0FBSyxNQUFNLEtBQUssSUFBSSxVQUFVLEVBQUU7b0JBQy9CLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUU7d0JBQ3RELFFBQVEsR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDO3FCQUNwQjtpQkFDRDtnQkFFRCxJQUFJLENBQUMsUUFBUSxFQUFFO29CQUNkLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBQSxnQkFBRyxFQUNsQiwwQkFBYSxDQUFDLEtBQUssRUFDbkIsR0FBRyxNQUFNLGdDQUFnQyxDQUN6QyxDQUFDLENBQUM7aUJBQ0g7Z0JBRUQsT0FBTyxRQUFRLENBQUM7YUFDaEI7WUFFRCxPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUNEO0FBdE1ELDBCQXNNQyJ9