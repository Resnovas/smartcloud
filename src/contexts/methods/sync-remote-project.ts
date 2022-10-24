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

import {log, LoggingLevels} from '../../logging.js';
import type {Project} from '../projects.js';

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

// Todo: refactor to reduce complexity

export async function syncRemoteProject(this: Project) {
	if (!this.config?.syncRemote) {
		return;
	}

	// eslint-disable-next-line unicorn/no-array-for-each
	this.config.syncRemote.forEach(async remote => {
		if (remote.localProject !== this.context.props.project.name) {
			return;
		}

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

		if (!(remote.owner ?? remote.user) || !remote.project) {
			throw new Error(log(
				LoggingLevels.error,
				'There is not a remote to connect.',
			));
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

		const remoteColumn = columns.find(
			column => column.name === this.context.props.localColumn?.name,
		);
		if (this.context.action !== 'created') {
			// Get the cards
			if (this.context.action === 'moved' && 'changes' in this.context.props && 'column_id' in this.context.props.changes!) {
				oldLocalColumn = await this.util.api.project.column.get(
					this.context.props.changes?.column_id.from,
				);
				oldRemoteColumn = columns.find(
					column => column.name === oldLocalColumn.name,
				);
				if (!oldRemoteColumn) {
					throw new Error(log(LoggingLevels.error, 'No column to use'));
				}

				remoteCard = await this.util.api.project.column.listCards(
					oldRemoteColumn.id,
				);
			} else {
				if (!remoteColumn) {
					throw new Error(log(LoggingLevels.error, 'No column to use'));
				}

				remoteCard = await this.util.api.project.column.listCards(
					remoteColumn.id,
				);
			}

			remoteCard = remoteCard.find(
				card => card.content_url === this.context.props.localCard?.content_url,
			);
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
				this.context.props.number,
				remoteColumn.id,
				'Issue',
			);
		} else {
			switch (this.context.action) {
				case 'moved': {
					if (!remoteColumn) {
						throw new Error(log(LoggingLevels.error, 'No column to use'));
					}

					this.util.api.project.card
						.move(remoteCard.id, remoteColumn.id)
						.catch(() => {
							throw new Error(log(
								LoggingLevels.error,
								'Error while attempting to move card',
							));
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
