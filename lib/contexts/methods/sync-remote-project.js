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
/* eslint-disable complexity */
const logging_js_1 = require("../../logging.js");
// Todo: refactor to reduce complexity
async function syncRemoteProject() {
    if (!this.config?.syncRemote) {
        return;
    }
    // eslint-disable-next-line unicorn/no-array-for-each
    this.config.syncRemote.forEach(async (remote) => {
        if (remote.localProject !== this.context.props.project.name) {
            return;
        }
        let oldRemoteColumn;
        let oldLocalColumn;
        let remoteCard;
        let projects;
        if (!(remote.owner ?? remote.user) || !remote.project) {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'There is not a remote to connect.'));
        }
        // Get projects
        if (remote.user) {
            projects = await this.util.api.project.projects.user(remote.user);
        }
        else if (remote.owner && !remote.repo) {
            projects = await this.util.api.project.projects.org(remote.owner);
        }
        else if (remote.owner && remote.repo) {
            projects = await this.util.api.project.projects.repo(remote.owner, remote.repo);
        }
        if (!projects) {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'No project to use'));
        }
        // Get the column
        const project = projects.find(project => project.name === remote.project);
        if (!project) {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'No project to use'));
        }
        const columns = await this.util.api.project.column.list(project.id);
        if (!columns) {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'No column to use'));
        }
        const remoteColumn = columns.find(column => column.name === this.context.props.localColumn?.name);
        if (this.context.action !== 'created') {
            // Get the cards
            if (this.context.action === 'moved' && 'changes' in this.context.props && 'column_id' in this.context.props.changes) {
                oldLocalColumn = await this.util.api.project.column.get(this.context.props.changes?.column_id.from);
                oldRemoteColumn = columns.find(column => column.name === oldLocalColumn.name);
                if (!oldRemoteColumn) {
                    throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'No column to use'));
                }
                remoteCard = await this.util.api.project.column.listCards(oldRemoteColumn.id);
            }
            else {
                if (!remoteColumn) {
                    throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'No column to use'));
                }
                remoteCard = await this.util.api.project.column.listCards(remoteColumn.id);
            }
            remoteCard = remoteCard.find(card => card.content_url === this.context.props.localCard?.content_url);
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
            await this.util.api.project.card.create(
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
    });
}
exports.syncRemoteProject = syncRemoteProject;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luYy1yZW1vdGUtcHJvamVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250ZXh0cy9tZXRob2RzL3N5bmMtcmVtb3RlLXByb2plY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNDRzs7O0FBRUgsK0JBQStCO0FBRS9CLGlEQUFvRDtBQStCcEQsc0NBQXNDO0FBRS9CLEtBQUssVUFBVSxpQkFBaUI7SUFDdEMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFO1FBQzdCLE9BQU87S0FDUDtJQUVELHFEQUFxRDtJQUNyRCxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFDLE1BQU0sRUFBQyxFQUFFO1FBQzdDLElBQUksTUFBTSxDQUFDLFlBQVksS0FBSyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFO1lBQzVELE9BQU87U0FDUDtRQUVELElBQUksZUFBZSxDQUFDO1FBQ3BCLElBQUksY0FTSCxDQUFDO1FBQ0YsSUFBSSxVQUFVLENBQUM7UUFDZixJQUFJLFFBQVEsQ0FBQztRQUViLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRTtZQUN0RCxNQUFNLElBQUksS0FBSyxDQUFDLElBQUEsZ0JBQUcsRUFDbEIsMEJBQWEsQ0FBQyxLQUFLLEVBQ25CLG1DQUFtQyxDQUNuQyxDQUFDLENBQUM7U0FDSDtRQUVELGVBQWU7UUFDZixJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDaEIsUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFD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