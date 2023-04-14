"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: sync-remote-project.ts
 * Path: \src\contexts\methods\sync-remote-project.ts
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
exports.syncRemoteProject = void 0;
const tslib_1 = require("tslib");
/* eslint-disable complexity */
const logging_js_1 = require("../../logging.js");
// Todo: refactor to reduce complexity
function syncRemoteProject() {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!((_a = this.config) === null || _a === void 0 ? void 0 : _a.syncRemote)) {
            return;
        }
        // eslint-disable-next-line unicorn/no-array-for-each
        this.config.syncRemote.forEach((remote) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            var _b, _c;
            if (remote.localProject !== this.context.props.project.name) {
                return;
            }
            let oldRemoteColumn;
            let oldLocalColumn;
            let remoteCard;
            let projects;
            if (!((_b = remote.owner) !== null && _b !== void 0 ? _b : remote.user) || !remote.project) {
                throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'There is not a remote to connect.'));
            }
            // Get projects
            if (remote.user) {
                projects = yield this.util.api.project.projects.user(remote.user);
            }
            else if (remote.owner && !remote.repo) {
                projects = yield this.util.api.project.projects.org(remote.owner);
            }
            else if (remote.owner && remote.repo) {
                projects = yield this.util.api.project.projects.repo(remote.owner, remote.repo);
            }
            if (!projects) {
                throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'No project to use'));
            }
            // Get the column
            const project = projects.find(project => project.name === remote.project);
            if (!project) {
                throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'No project to use'));
            }
            const columns = yield this.util.api.project.column.list(project.id);
            if (!columns) {
                throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'No column to use'));
            }
            const remoteColumn = columns.find(column => { var _a; return column.name === ((_a = this.context.props.localColumn) === null || _a === void 0 ? void 0 : _a.name); });
            if (this.context.action !== 'created') {
                // Get the cards
                if (this.context.action === 'moved' && 'changes' in this.context.props && 'column_id' in this.context.props.changes) {
                    oldLocalColumn = yield this.util.api.project.column.get((_c = this.context.props.changes) === null || _c === void 0 ? void 0 : _c.column_id.from);
                    oldRemoteColumn = columns.find(column => column.name === oldLocalColumn.name);
                    if (!oldRemoteColumn) {
                        throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'No column to use'));
                    }
                    remoteCard = yield this.util.api.project.column.listCards(oldRemoteColumn.id);
                }
                else {
                    if (!remoteColumn) {
                        throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'No column to use'));
                    }
                    remoteCard = yield this.util.api.project.column.listCards(remoteColumn.id);
                }
                remoteCard = remoteCard.find(card => { var _a; return card.content_url === ((_a = this.context.props.localCard) === null || _a === void 0 ? void 0 : _a.content_url); });
                if (!remoteCard) {
                    throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'No remote card to use'));
                }
            }
            if (this.context.action === 'created' || !remoteCard) {
                if (!remoteColumn) {
                    throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'No column to use'));
                }
                if (!('number' in this.context.props)) {
                    throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'No id to use'));
                }
                yield this.util.api.project.card.create(
                // @ts-expect-error number exists when it should
                this.context.props.number, remoteColumn.id, 'Issue');
            }
            else {
                switch (this.context.action) {
                    case 'moved': {
                        if (!remoteColumn) {
                            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'No column to use'));
                        }
                        this.util.api.project.card
                            .move(remoteCard.id, remoteColumn.id)
                            .catch(() => {
                            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error while attempting to move card'));
                        });
                        (0, logging_js_1.log)(logging_js_1.LoggingLevels.info, 'Successfully moved card to new column');
                        break;
                    }
                    case 'edited': {
                        // TODO: Need to workout the correct specification for this
                        break;
                    }
                    case 'deleted': {
                        // TODO: Need to workout the correct specification for this
                        break;
                    }
                    // No default
                }
            }
        }));
    });
}
exports.syncRemoteProject = syncRemoteProject;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luYy1yZW1vdGUtcHJvamVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250ZXh0cy9tZXRob2RzL3N5bmMtcmVtb3RlLXByb2plY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNDRzs7OztBQUVILCtCQUErQjtBQUUvQixpREFBb0Q7QUErQnBELHNDQUFzQztBQUV0QyxTQUFzQixpQkFBaUI7OztRQUN0QyxJQUFJLENBQUMsQ0FBQSxNQUFBLElBQUksQ0FBQyxNQUFNLDBDQUFFLFVBQVUsQ0FBQSxFQUFFO1lBQzdCLE9BQU87U0FDUDtRQUVELHFEQUFxRDtRQUNyRCxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBTSxNQUFNLEVBQUMsRUFBRTs7WUFDN0MsSUFBSSxNQUFNLENBQUMsWUFBWSxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUU7Z0JBQzVELE9BQU87YUFDUDtZQUVELElBQUksZUFBZSxDQUFDO1lBQ3BCLElBQUksY0FTSCxDQUFDO1lBQ0YsSUFBSSxVQUFVLENBQUM7WUFDZixJQUFJLFFBQVEsQ0FBQztZQUViLElBQUksQ0FBQyxDQUFDLE1BQUEsTUFBTSxDQUFDLEtBQUssbUNBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRTtnQkFDdEQsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFBLGdCQUFHLEVBQ2xCLDBCQUFhLENBQUMsS0FBSyxFQUNuQixtQ0FBbUMsQ0FDbkMsQ0FBQyxDQUFDO2FBQ0g7WUFFRCxlQUFlO1lBQ2YsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFO2dCQUNoQixRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDbEU7aUJBQU0sSUFBSSxNQUFNLENBQUMsS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTtnQkFDeEMsUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ2xFO2lCQUFNLElBQUksTUFBTSxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFO2dCQUN2QyxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FDbkQsTUFBTSxDQUFDLEtBQUssRUFDWixNQUFNLENBQUMsSUFBSSxDQUNYLENBQUM7YUFDRjtZQUVELElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2QsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFBLGdCQUFHLEVBQUMsMEJBQWEsQ0FBQyxLQUFLLEVBQUUsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO2FBQy9EO1lBRUQsaUJBQWlCO1lBQ2pCLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMxRSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNiLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBQSxnQkFBRyxFQUFDLDBCQUFhLENBQUMsS0FBSyxFQUFFLG1CQUFtQixDQUFDLENBQUMsQ0FBQzthQUMvRDtZQUVELE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3BFLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2IsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFBLGdCQUFHLEVBQUMsMEJBQWEsQ0FBQyxLQUFLLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO2FBQzlEO1lBRUQsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FDaEMsTUFBTSxDQUFDLEVBQUUsV0FBQyxPQUFBLE1BQU0sQ0FBQyxJQUFJLE1BQUssTUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLDBDQUFFLElBQUksQ0FBQSxDQUFBLEVBQUEsQ0FDOUQsQ0FBQztZQUNGLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFO2dCQUN0QyxnQkFBZ0I7Z0JBQ2hCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEtBQUssT0FBTyxJQUFJLFNBQVMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssSUFBSSxXQUFXLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBUSxFQUFFO29CQUNySCxjQUFjLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FDdEQsTUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLDBDQUFFLFNBQVMsQ0FBQyxJQUFJLENBQzFDLENBQUM7b0JBQ0YsZUFBZSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQzdCLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxjQUFjLENBQUMsSUFBSSxDQUM3QyxDQUFDO29CQUNGLElBQUksQ0FBQyxlQUFlLEVBQUU7d0JBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBQSxnQkFBRyxFQUFDLDBCQUFhLENBQUMsS0FBSyxFQUFFLGtCQUFrQixDQUFDLENBQUMsQ0FBQztxQkFDOUQ7b0JBRUQsVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQ3hELGVBQWUsQ0FBQyxFQUFFLENBQ2xCLENBQUM7aUJBQ0Y7cUJBQU07b0JBQ04sSUFBSSxDQUFDLFlBQVksRUFBRTt3QkFDbEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFBLGdCQUFHLEVBQUMsMEJBQWEsQ0FBQyxLQUFLLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO3FCQUM5RDtvQkFFRCxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FDeEQsWUFBWSxDQUFDLEVBQUUsQ0FDZixDQUFDO2lCQUNGO2dCQUVELFVBQVUsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUMzQixJQUFJLENBQUMsRUFBRSxXQUFDLE9BQUEsSUFBSSxDQUFDLFdBQVcsTUFBSyxNQUFBLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsMENBQUUsV0FBVyxDQUFBLENBQUEsRUFBQSxDQUN0RSxDQUFDO2dCQUNGLElBQUksQ0FBQyxVQUFVLEVBQUU7b0JBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBQSxnQkFBRyxFQUFDLDBCQUFhLENBQUMsS0FBSyxFQUFFLHVCQUF1QixDQUFDLENBQUMsQ0FBQztpQkFDbkU7YUFDRDtZQUVELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEtBQUssU0FBUyxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUNyRCxJQUFJLENBQUMsWUFBWSxFQUFFO29CQUNsQixNQUFNLElBQUksS0FBSyxDQUFDLElBQUEsZ0JBQUcsRUFBQywwQkFBYSxDQUFDLEtBQUssRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7aUJBQzlEO2dCQUVELElBQUksQ0FBQyxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUN0QyxNQUFNLElBQUksS0FBSyxDQUFDLElBQUEsZ0JBQUcsRUFBQywwQkFBYSxDQUFDLEtBQUssRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDO2lCQUMxRDtnQkFFRCxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTTtnQkFDdEMsZ0RBQWdEO2dCQUNoRCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQ3pCLFlBQVksQ0FBQyxFQUFFLEVBQ2YsT0FBTyxDQUNQLENBQUM7YUFDRjtpQkFBTTtnQkFDTixRQUFRLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFO29CQUM1QixLQUFLLE9BQU8sQ0FBQyxDQUFDO3dCQUNiLElBQUksQ0FBQyxZQUFZLEVBQUU7NEJBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBQSxnQkFBRyxFQUFDLDBCQUFhLENBQUMsS0FBSyxFQUFFLGtCQUFrQixDQUFDLENBQUMsQ0FBQzt5QkFDOUQ7d0JBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUk7NkJBQ3hCLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLFlBQVksQ0FBQyxFQUFFLENBQUM7NkJBQ3BDLEtBQUssQ0FBQyxHQUFHLEVBQUU7NEJBQ1gsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFBLGdCQUFHLEVBQ2xCLDBCQUFhLENBQUMsS0FBSyxFQUNuQixxQ0FBcUMsQ0FDckMsQ0FBQyxDQUFDO3dCQUNKLENBQUMsQ0FBQyxDQUFDO3dCQUNKLElBQUEsZ0JBQUcsRUFBQywwQkFBYSxDQUFDLElBQUksRUFBRSx1Q0FBdUMsQ0FBQyxDQUFDO3dCQUVqRSxNQUFNO3FCQUNOO29CQUVELEtBQUssUUFBUSxDQUFDLENBQUM7d0JBQ2QsMkRBQTJEO3dCQUUzRCxNQUFNO3FCQUNOO29CQUVELEtBQUssU0FBUyxDQUFDLENBQUM7d0JBQ2YsMkRBQTJEO3dCQUUzRCxNQUFNO3FCQUNOO29CQUNELGFBQWE7aUJBQ2I7YUFDRDtRQUNGLENBQUMsQ0FBQSxDQUFDLENBQUM7O0NBQ0g7QUFsSkQsOENBa0pDIn0=