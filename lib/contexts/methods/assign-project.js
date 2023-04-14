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
const tslib_1 = require("tslib");
const logging_js_1 = require("../../logging.js");
const evaluator_js_1 = require("../../evaluator.js");
function assignProject() {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!((_a = this.config) === null || _a === void 0 ? void 0 : _a.assignProject)) {
            return;
        }
        // eslint-disable-next-line unicorn/no-array-for-each
        this.config.assignProject.forEach((remote) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            // Get projects
            let projects;
            if (remote.user) {
                projects = yield this.util.api.project.projects.user(remote.user);
            }
            else if (remote.owner && !remote.repo) {
                projects = yield this.util.api.project.projects.org(remote.owner);
            }
            else if (remote.owner && remote.repo) {
                projects = yield this.util.api.project.projects.repo(remote.owner, remote.repo);
            }
            else {
                projects = yield this.util.api.project.projects.repo(this.util.repo.owner, this.util.repo.repo);
            }
            // Get the column
            const project = projects.find(project => project.name === remote.project);
            if (!project) {
                throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'No project to use'));
            }
            const columns = yield this.util.api.project.column.list(project.id);
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
                    yield this.util.api.project.card
                        .create(this.context.props.number, remoteColumn.id, this.context.props.type === 'pr' ? 'PullRequest' : 'Issue')
                        .catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, error));
                    }));
                }
            }
        }));
    });
}
exports.assignProject = assignProject;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzaWduLXByb2plY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udGV4dHMvbWV0aG9kcy9hc3NpZ24tcHJvamVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHOzs7O0FBR0gsaURBQW9EO0FBRXBELHFEQUE2QztBQTZCN0MsU0FBc0IsYUFBYTs7O1FBQ2xDLElBQUksQ0FBQyxDQUFBLE1BQUEsSUFBSSxDQUFDLE1BQU0sMENBQUUsYUFBYSxDQUFBLEVBQUU7WUFDaEMsT0FBTztTQUNQO1FBRUQscURBQXFEO1FBQ3JELElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFNLE1BQU0sRUFBQyxFQUFFO1lBQ2hELGVBQWU7WUFDZixJQUFJLFFBQVEsQ0FBQztZQUNiLElBQUksTUFBTSxDQUFDLElBQUksRUFBRTtnQkFDaEIsUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2xFO2lCQUFNLElBQUksTUFBTSxDQUFDLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUU7Z0JBQ3hDLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNsRTtpQkFBTSxJQUFJLE1BQU0sQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDLElBQUksRUFBRTtnQkFDdkMsUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQ25ELE1BQU0sQ0FBQyxLQUFLLEVBQ1osTUFBTSxDQUFD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