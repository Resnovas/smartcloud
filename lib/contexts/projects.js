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
    /**
     * Parse the Project Context
     * @author IvanFon, TGTGamer, jbinda
     * @since 1.0.0
     */
    static parse(utils, config, context) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
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
            const issue = yield utils.api.issues.get(issueNumber);
            const labels = yield utils.parsingData
                .labels(issue.labels)
                .catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while parsing labels: ' + String(error)));
            }));
            let currentVersion;
            if (config.versioning) {
                currentVersion = yield utils.versioning
                    .parse(config, (_a = config.issue) === null || _a === void 0 ? void 0 : _a.ref)
                    .catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while parsing versioning: ' + String(error)));
                }));
            }
            const localProject = yield utils.api.project.projects.get(project.id);
            const localColumn = yield utils.api.project.column.get(project.column_id);
            const localCard = yield utils.api.project.card.get(project.id);
            return Object.assign(Object.assign({}, context), { currentVersion, 
                // Todo: ask for advice on how to resolve
                // @ts-expect-error due to the range of possible types, it throws an error even though its fully populated
                props: Object.assign(Object.assign({ type: 'project' }, project), { project: localProject, localColumn,
                    localCard,
                    labels }) });
        });
    }
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
    run(attempt) {
        var _a, _b;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
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
                        = yield this.convertColumnStringsToIdArray(this.config.enforceConventions.onColumn);
                    if ((_b = (_a = this.config.enforceConventions) === null || _a === void 0 ? void 0 : _a.onColumn) === null || _b === void 0 ? void 0 : _b.includes(this.context.props.column_id)) {
                        yield this.conventions.enforce(this);
                    }
                }
                if (this.config.labels) {
                    yield this.applyLabels(this).catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error applying labels' + String(error)));
                    }));
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
                setTimeout(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield this.run(attempt);
                }), seconds * 1000);
            }
        });
    }
    convertColumnStringsToIdArray(columns) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const columnList = yield this.util.api.project.column.list(this.context.props.project.id);
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
        });
    }
}
exports.Project = Project;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvamVjdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29udGV4dHMvcHJvamVjdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNDRzs7OztBQUVILDREQUFzQztBQU10Qyw4Q0FBaUQ7QUFDakQsaURBQTRDO0FBd0I1QyxNQUFhLE9BQVEsU0FBUSxtQkFBUTtJQUNwQzs7OztPQUlHO0lBQ0gsTUFBTSxDQUFPLEtBQUssQ0FDakIsS0FBWSxFQUNaLE1BQWMsRUFDZCxPQUFnQjs7O1lBRWhCLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUEyQixDQUFDO1lBQ3BELE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUM7WUFDckMsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDYixPQUFPO2FBQ1A7WUFFRCxJQUFBLGdCQUFHLEVBQ0YsMEJBQWEsQ0FBQyxLQUFLLEVBQ25CLGlDQUFpQyxJQUFJLENBQUMsU0FBUyxDQUM5QyxPQUFPLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FDNUIsRUFBRSxDQUNILENBQUM7WUFFRixJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRTtnQkFDekIsTUFBTSxJQUFJLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO2FBQ2pEO1lBRUQsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUMvQixNQUFNLEtBQUssR0FBRyxNQUFNLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUV0RCxNQUFNLE1BQU0sR0FBRyxNQUFNLEtBQUssQ0FBQyxXQUFXO2lCQUNwQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztpQkFDcEIsS0FBSyxDQUFDLENBQU0sS0FBSyxFQUFDLEVBQUU7Z0JBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBQSxn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