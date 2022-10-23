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

import type {Issues, PullRequests} from '..';
import {log, LoggingLevels} from '../../logging';
import type {IssueConditionConfig} from '../../conditions';
import {evaluator} from '../../evaluator';

/**
 * Assign project configuration
 */
export type AssignProject = {
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
	/**
	 * The column to use
	 */
	column: string;
} & IssueConditionConfig;
export async function assignProject(this: Issues | PullRequests) {
	if (!this.config?.assignProject) {
		return;
	}

	// eslint-disable-next-line unicorn/no-array-for-each
	this.config.assignProject.forEach(async remote => {
		// Get projects
		let projects;
		if (remote.user) {
			projects = await this.util.api.project.projects.user(remote.user);
		} else if (remote.owner && !remote.repo) {
			projects = await this.util.api.project.projects.org(remote.owner);
		} else if (remote.owner && remote.repo) {
			projects = await this.util.api.project.projects.repo(
				remote.owner,
				remote.repo,
			);
		} else {
			projects = await this.util.api.project.projects.repo(
				this.util.repo.owner,
				this.util.repo.repo,
			);
		}

		// Get the column
		const project = projects.find(project => project.name === remote.project);
		if (!project) {
			throw new Error(log(LoggingLevels.error, 'No project to use'));
		}

		const columns = await this.util.api.project.column.list(project.id);
		if (!columns) {
			throw new Error(log(LoggingLevels.error, 'No columns to use'));
		}

		const remoteColumn = columns.find(
			column => column.name === remote.column,
		);
		if (!remoteColumn) {
			throw new Error(log(LoggingLevels.error, 'No column to use'));
		}

		const should
			= remote.condition.length > 0
				? evaluator.call(this, remote, this.context.props)
				: true;

		if (should) {
			log(LoggingLevels.debug, `Adding to project ${project.name}`);
			if (this.dryRun && 'number' in this.context.props) {
				await this.util.api.project.card
					.create(
						this.context.props.number,
						remoteColumn.id,
						this.context.props.type === 'pr' ? 'PullRequest' : 'Issue',
					)
					.catch(async error => {
						throw new Error(log(
							LoggingLevels.error,
							error,
						));
					});
			}
		}
	});
}
