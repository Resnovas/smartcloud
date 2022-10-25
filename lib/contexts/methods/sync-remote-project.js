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
/* eslint-disable complexity */
import { log, LoggingLevels } from '../../logging.js';
// Todo: refactor to reduce complexity
export async function syncRemoteProject() {
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
            throw new Error(log(LoggingLevels.error, 'There is not a remote to connect.'));
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
            throw new Error(log(LoggingLevels.error, 'No project to use'));
        }
        // Get the column
        const project = projects.find(project => project.name === remote.project);
        if (!project) {
            throw new Error(log(LoggingLevels.error, 'No project to use'));
        }
        const columns = await this.util.api.project.column.list(project.id);
        if (!columns) {
            throw new Error(log(LoggingLevels.error, 'No column to use'));
        }
        const remoteColumn = columns.find(column => column.name === this.context.props.localColumn?.name);
        if (this.context.action !== 'created') {
            // Get the cards
            if (this.context.action === 'moved' && 'changes' in this.context.props && 'column_id' in this.context.props.changes) {
                oldLocalColumn = await this.util.api.project.column.get(this.context.props.changes?.column_id.from);
                oldRemoteColumn = columns.find(column => column.name === oldLocalColumn.name);
                if (!oldRemoteColumn) {
                    throw new Error(log(LoggingLevels.error, 'No column to use'));
                }
                remoteCard = await this.util.api.project.column.listCards(oldRemoteColumn.id);
            }
            else {
                if (!remoteColumn) {
                    throw new Error(log(LoggingLevels.error, 'No column to use'));
                }
                remoteCard = await this.util.api.project.column.listCards(remoteColumn.id);
            }
            remoteCard = remoteCard.find(card => card.content_url === this.context.props.localCard?.content_url);
            if (!remoteCard) {
                throw new Error(log(LoggingLevels.error, 'No remote card to use'));
            }
        }
        if (this.context.action === 'created' || !remoteCard) {
            if (!remoteColumn) {
                throw new Error(log(LoggingLevels.error, 'No column to use'));
            }
            if (!('number' in this.context.props)) {
                throw new Error(log(LoggingLevels.error, 'No id to use'));
            }
            await this.util.api.project.card.create(
            // @ts-expect-error number exists when it should
            this.context.props.number, remoteColumn.id, 'Issue');
        }
        else {
            switch (this.context.action) {
                case 'moved': {
                    if (!remoteColumn) {
                        throw new Error(log(LoggingLevels.error, 'No column to use'));
                    }
                    this.util.api.project.card
                        .move(remoteCard.id, remoteColumn.id)
                        .catch(() => {
                        throw new Error(log(LoggingLevels.error, 'Error while attempting to move card'));
                    });
                    log(LoggingLevels.info, 'Successfully moved card to new column');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luYy1yZW1vdGUtcHJvamVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250ZXh0cy9tZXRob2RzL3N5bmMtcmVtb3RlLXByb2plY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHO0FBRUgsK0JBQStCO0FBRS9CLE9BQU8sRUFBQyxHQUFHLEVBQUUsYUFBYSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUErQnBELHNDQUFzQztBQUV0QyxNQUFNLENBQUMsS0FBSyxVQUFVLGlCQUFpQjtJQUN0QyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUU7UUFDN0IsT0FBTztLQUNQO0lBRUQscURBQXFEO0lBQ3JELElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUMsTUFBTSxFQUFDLEVBQUU7UUFDN0MsSUFBSSxNQUFNLENBQUMsWUFBWSxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUU7WUFDNUQsT0FBTztTQUNQO1FBRUQsSUFBSSxlQUFlLENBQUM7UUFDcEIsSUFBSSxjQVNILENBQUM7UUFDRixJQUFJLFVBQVUsQ0FBQztRQUNmLElBQUksUUFBUSxDQUFDO1FBRWIsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFO1lBQ3RELE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxDQUNsQixhQUFhLENBQUMsS0FBSyxFQUNuQixtQ0FBbUMsQ0FDbkMsQ0FBQyxDQUFDO1NBQ0g7UUFFRCxlQUFlO1FBQ2YsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFO1lBQ2hCLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNsRTthQUFNLElBQUksTUFBTSxDQUFDLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDeEMsUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ2xFO2FBQU0sSUFBSSxNQUFNLENBQUMsS0FBSyxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDdkMsUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQ25ELE1BQU0sQ0FBQyxLQUFLLEVBQ1osTUFBTSxDQUFDLElBQUksQ0FDWCxDQUFDO1NBQ0Y7UUFFRCxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2QsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7U0FDL0Q7UUFFRCxpQkFBaUI7UUFDakIsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzFFLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDYixNQUFNLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLG1CQUFtQixDQUFDLENBQUMsQ0FBQztTQUMvRDtRQUVELE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3BFLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDYixNQUFNLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLGtCQUFrQixDQUFDLENBQUMsQ0FBQztTQUM5RDtRQUVELE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQ2hDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUM5RCxDQUFDO1FBQ0YsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUU7WUFDdEMsZ0JBQWdCO1lBQ2hCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEtBQUssT0FBTyxJQUFJLFNBQVMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssSUFBSSxXQUFXLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBUSxFQUFFO2dCQUNySCxjQUFjLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FDdEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQzFDLENBQUM7Z0JBQ0YsZUFBZSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQzdCLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxjQUFjLENBQUMsSUFBSSxDQUM3QyxDQUFDO2dCQUNGLElBQUksQ0FBQyxlQUFlLEVBQUU7b0JBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO2lCQUM5RDtnQkFFRCxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FDeEQsZUFBZSxDQUFDLEVBQUUsQ0FDbEIsQ0FBQzthQUNGO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxZQUFZLEVBQUU7b0JBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO2lCQUM5RDtnQkFFRCxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FDeEQsWUFBWSxDQUFDLEVBQUUsQ0FDZixDQUFDO2FBQ0Y7WUFFRCxVQUFVLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FDM0IsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQ3RFLENBQUM7WUFDRixJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUNoQixNQUFNLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLHVCQUF1QixDQUFDLENBQUMsQ0FBQzthQUNuRTtTQUNEO1FBRUQsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sS0FBSyxTQUFTLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDckQsSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDbEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7YUFDOUQ7WUFFRCxJQUFJLENBQUMsQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDdEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDO2FBQzFEO1lBRUQsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU07WUFDdEMsZ0RBQWdEO1lBQ2hELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFDekIsWUFBWSxDQUFDLEVBQUUsRUFDZixPQUFPLENBQ1AsQ0FBQztTQUNGO2FBQU07WUFDTixRQUFRLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFO2dCQUM1QixLQUFLLE9BQU8sQ0FBQyxDQUFDO29CQUNiLElBQUksQ0FBQyxZQUFZLEVBQUU7d0JBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO3FCQUM5RDtvQkFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSTt5QkFDeEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsWUFBWSxDQUFDLEVBQUUsQ0FBQzt5QkFDcEMsS0FBSyxDQUFDLEdBQUcsRUFBRTt3QkFDWCxNQUFNLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FDbEIsYUFBYSxDQUFDLEtBQUssRUFDbkIscUNBQXFDLENBQ3JDLENBQUMsQ0FBQztvQkFDSixDQUFDLENBQUMsQ0FBQztvQkFDSixHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSx1Q0FBdUMsQ0FBQyxDQUFDO29CQUVqRSxNQUFNO2lCQUNOO2dCQUVELEtBQUssUUFBUSxDQUFDLENBQUM7b0JBQ2QsMkRBQTJEO29CQUUzRCxNQUFNO2lCQUNOO2dCQUVELEtBQUssU0FBUyxDQUFDLENBQUM7b0JBQ2YsMkRBQTJEO29CQUUzRCxNQUFNO2lCQUNOO2dCQUNELGFBQWE7YUFDYjtTQUNEO0lBQ0YsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDIn0=