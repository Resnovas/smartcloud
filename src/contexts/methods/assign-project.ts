/**
 * Project: @resnovas/smartcloud
 * File: assignProject.ts
 * Path: \src\contexts\methods\assignProject.ts
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

import {LoggingLevels} from '@resnovas/utilities';
import type {Issues, PullRequests} from '..';
import {log} from '../../logging';
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
			throw await log(LoggingLevels.error, 'No project to use');
		}

		const columns = await this.util.api.project.column.list(project.id);
		if (!columns) {
			throw await log(LoggingLevels.error, 'No columns to use');
		}

		const remoteColumn = columns.find(
			column => column.name === remote.column,
		);
		if (!remoteColumn) {
			throw await log(LoggingLevels.error, 'No column to use');
		}

		const should
			= remote.condition.length > 0
				? evaluator.call(this, remote, this.context.props)
				: true;

		if (should) {
			await log(LoggingLevels.debug, `Adding to project ${project.name}`);
			!this.dryRun
				&& (await this.util.api.project.card
					.create(
						this.context.IDNumber,
						remoteColumn.id,
						this.context.props.type === 'pr' ? 'PullRequest' : 'Issue',
					)
					.catch(async error => {
						await log(
							LoggingLevels.error,
							`New error thrown when attempting to add to project "${project.name}"`
							+ error,
						);
					}));
		}
	});
}
