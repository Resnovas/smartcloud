"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: assign-project.ts
 * Path: \src\contexts\methods\assign-project.ts
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
exports.assignProject = void 0;
const logging_js_1 = require("../../logging.js");
const evaluator_js_1 = require("../../evaluator.js");
async function assignProject() {
    if (!this.config?.assignProject) {
        return;
    }
    // eslint-disable-next-line unicorn/no-array-for-each
    this.config.assignProject.forEach(async (remote) => {
        // Get projects
        let projects;
        if (remote.user) {
            projects = await this.util.api.project.projects.user(remote.user);
        }
        else if (remote.owner && !remote.repo) {
            projects = await this.util.api.project.projects.org(remote.owner);
        }
        else if (remote.owner && remote.repo) {
            projects = await this.util.api.project.projects.repo(remote.owner, remote.repo);
        }
        else {
            projects = await this.util.api.project.projects.repo(this.util.repo.owner, this.util.repo.repo);
        }
        // Get the column
        const project = projects.find(project => project.name === remote.project);
        if (!project) {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'No project to use'));
        }
        const columns = await this.util.api.project.column.list(project.id);
        if (!columns) {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'No columns to use'));
        }
        const remoteColumn = columns.find(column => column.name === remote.column);
        if (!remoteColumn) {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'No column to use'));
        }
        const should = remote.condition.length > 0
            ? evaluator_js_1.evaluator.call(this, remote, this.context.props)
            : true;
        if (should) {
            (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, `Adding to project ${project.name}`);
            if (this.dryRun && 'number' in this.context.props) {
                await this.util.api.project.card
                    .create(this.context.props.number, remoteColumn.id, this.context.props.type === 'pr' ? 'PullRequest' : 'Issue')
                    .catch(async (error) => {
                    throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, error));
                });
            }
        }
    });
}
exports.assignProject = assignProject;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzaWduLXByb2plY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udGV4dHMvbWV0aG9kcy9hc3NpZ24tcHJvamVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHOzs7QUFHSCxpREFBb0Q7QUFFcEQscURBQTZDO0FBNkJ0QyxLQUFLLFVBQVUsYUFBYTtJQUNsQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxhQUFhLEVBQUU7UUFDaEMsT0FBTztLQUNQO0lBRUQscURBQXFEO0lBQ3JELElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUMsTUFBTSxFQUFDLEVBQUU7UUFDaEQsZUFBZTtRQUNmLElBQUksUUFBUSxDQUFDO1FBQ2IsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFO1lBQ2hCLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNsRTthQUFNLElBQUksTUFBTSxDQUFDLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDeEMsUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ2xFO2FBQU0sSUFBSSxNQUFNLENBQUMsS0FBSyxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDdkMsUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQ25ELE1BQU0sQ0FBQyxLQUFLLEVBQ1osTUFBTSxDQUFDLElBQUksQ0FDWCxDQUFD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