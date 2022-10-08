/**
 * Project: @resnovas/smartcloud
 * File: syncRemoteProject.ts
 * Path: \src\contexts\methods\syncRemoteProject.ts
 * Created Date: Monday, September 5th 2022
 * Author: Jonathan Stevens
 * -----
 * Last Modified: Sun Sep 25 2022
 * Modified By: Jonathan Stevens
 * Current Version: 1.0.0-beta.0
 * -----
 * Copyright (c) 2022 Resnovas - All Rights Reserved
 * -----
 * LICENSE: GNU General Public License v3.0 or later (GPL-3.0+)
 *
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
 * along with this program. If not, please write to: jonathan@resnovas.com ,
 * or see https://www.gnu.org/licenses/gpl-3.0-standalone.html
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE - PLEASE SEE THE LICENSE FILE FOR DETAILS
 * -----
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */

import {LoggingDataClass, LoggingLevels} from '@resnovas/utilities';
import {log} from '../../logging';
import type {Project} from '../projects';

/**
 * External projects configuration
 */
export type ExProjects = {
	/**
	 * The local project to sync
	 */
	localProject: string;
	/**
	 * The owner of the project
	 */
	owner?: string;
	/**
	 * The user of the project
	 */
	user?: string;
	/**
	 * The repository name
	 * @requires owner
	 */
	repo?: string;
	/**
	 * The project to use
	 * @requires owner|user|repo
	 */
	project: string;
};

export async function syncRemoteProject(this: Project) {
	if (!this.config?.syncRemote) {
		return;
	}

	this.config.syncRemote.forEach(async remote => {
		if (remote.localProject !== this.context.props.project.name) {
			return;
		}

		let remoteColumn;
		let oldRemoteColumn;
		let oldLocalColumn: {
			name: any;
			cards_url: string;
			created_at: string;
			id: number;
			node_id: string;
			project_url: string;
			updated_at: string;
			url: string;
		};
		let remoteCard;
		let projects;

		if (!(remote.owner || remote.user) || !remote.project) {
			throw new LoggingDataClass(
				LoggingLevels.error,
				'There is not a remote to connect.',
			);
		}

		// Get projects
		if (remote.user) {
			projects = await this.util.api.project.projects.user(remote.user);
		} else if (remote.owner && !remote.repo) {
			projects = await this.util.api.project.projects.org(remote.owner);
		} else if (remote.owner && remote.repo) {
			projects = await this.util.api.project.projects.repo(
				remote.owner,
				remote.repo,
			);
		}

		if (!projects) {
			throw log(LoggingLevels.error, 'No project to use');
		}

		// Get the column
		const project = projects.find(project => project.name === remote.project);
		if (!project) {
			throw log(LoggingLevels.error, 'No project to use');
		}

		const columns = await this.util.api.project.column.list(project.id);
		if (!columns) {
			throw log(LoggingLevels.error, 'No column to use');
		}

		remoteColumn = columns.find(
			column => column.name === this.context.props.localColumn.name,
		);
		if (this.context.action !== 'created') {
			// Get the cards
			if (this.context.action === 'moved') {
				oldLocalColumn = await this.util.api.project.column.get(
					this.context.props.changes.column_id.from,
				);
				oldRemoteColumn = columns.find(
					column => column.name === oldLocalColumn.name,
				);
				if (!oldRemoteColumn) {
					throw log(LoggingLevels.error, 'No column to use');
				}

				remoteCard = await this.util.api.project.column.listCards(
					oldRemoteColumn.id,
				);
			} else {
				if (!remoteColumn) {
					throw log(LoggingLevels.error, 'No column to use');
				}

				remoteCard = await this.util.api.project.column.listCards(
					remoteColumn.id,
				);
			}

			remoteCard = remoteCard.find(
				card => card.content_url === this.context.props.localCard.content_url,
			);
			if (!remoteCard) {
				throw log(LoggingLevels.error, 'No remote card to use');
			}
		}

		if (this.context.action === 'created' || !remoteCard) {
			if (!remoteColumn) {
				throw log(LoggingLevels.error, 'No column to use');
			}

			this.util.api.project.card.create(
				this.context.IDNumber,
				remoteColumn.id,
				'Issue',
			);
		} else {
			switch (this.context.action) {
				case 'moved': {
					if (!remoteColumn) {
						throw log(LoggingLevels.error, 'No column to use');
					}

					this.util.api.project.card
						.move(remoteCard.id, remoteColumn.id)
						.catch(error => {
							throw new LoggingDataClass(
								LoggingLevels.error,
								'Error while attempting to move card',
								error,
							);
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
