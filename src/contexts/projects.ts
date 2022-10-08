/**
 * Project: @resnovas/smartcloud
 * File: projects.ts
 * Path: \src\contexts\projects.ts
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

import * as core from '@actions/core';
import type {Context} from '@actions/github/lib/context';
import {LoggingDataClass, LoggingLevels} from '@resnovas/utilities';
import type {Config, Runners, SharedConfig} from '../types';
import type {CurContext, ProjectContext, Version} from '../conditions';
import type {Utils} from '../utils';
import {Contexts, log} from './methods';
import type {Column} from './methods/conventions';
import type {ProjectCreateBranch} from './methods/create-branch';
import type {Milestones} from './methods/handle-milestone';
import type {ExProjects} from './methods/syncRemoteProject';

/**
 * The project configuration
 */
export type ProjectConfig = {
	/**
	 * Syncronise remote repository configuration.
	 */
	syncRemote?: ExProjects[];
	/**
	 * Open branch configuration
	 */
	openBranch?: ProjectCreateBranch;
	/**
	 * Assign to milestone configuration
	 */
	assignMilestone?: Record<string, Milestones>;
} & SharedConfig;

export class Project extends Contexts {
	/**
	 * Parse the Project Context
	 * @author IvanFon, TGTGamer, jbinda
	 * @since 1.0.0
	 */
	 static async parse(
		utils: Utils,
		config: Config,
		context: Context,
	): Promise<ProjectContext | undefined> {
		const project = context.payload.project_card;
		if (!project) {
			return;
		}

		await log(
			LoggingLevels.debug,
			`context.payload.project_card: ${JSON.stringify(
				context.payload.project_card,
			)}`,
		);

		if (!project.content_url) {
			throw new Error('No content information to get');
		}

		const issueNumber: number = project.content_url.split('/').pop();
		const issue = await utils.api.issues.get(issueNumber);

		const labels = await utils.parsingData
			.labels(issue.labels)
			.catch(error => {
				await log(LoggingLevels.error, 'Error thrown while parsing labels: ' + String(error));
				throw error;
			});

		let currentVersion: Version | undefined;
		if (config.versioning) {
			currentVersion = await utils.versioning
				.parse(config, config.issue?.ref)
				.catch(error => {
					await log(
						LoggingLevels.error,
						'Error thrown while parsing versioning: ' + String(error),
					);
					throw new Error(error);
				});
		}

		let localProject;
		localProject = await utils.api.project.projects.get(
			project.project_url.split('/').pop(),
		);
		const changes = context.payload.changes;
		const localColumn = await utils.api.project.column.get(project.column_id);

		const localCard = await utils.api.project.card.get(project.id);

		return {
			sha: context.sha,
			action: context.payload.action!,
			currentVersion,
			IDNumber: issue.id,
			props: {
				type: 'project',
				ID: issue.number,
				creator: issue.user?.login ? issue.user.login : '',
				description: issue.body || '',
				locked: issue.locked,
				state: issue.state as ProjectContext['props']['state'],
				title: issue.title,
				project: localProject,
				column_id: project.column_id,
				localColumn,
				localCard,
				changes,
				labels,
			},
		};
	}

	context: ProjectContext;
	config: ProjectConfig;
	constructor(
		util: Utils,
		runners: Runners,
		configs: Config,
		curContext: CurContext,
		dryRun: boolean,
	) {
		if (curContext.type !== 'project') {
			throw new LoggingDataClass(
				LoggingLevels.error,
				'Cannot construct without project context',
			);
		}

		super(util, runners, configs, curContext, dryRun);
		this.context = curContext.context;
		if (!configs.project) {
			throw new LoggingDataClass(
				LoggingLevels.error,
				'Cannot start without config',
			);
		}

		this.config = configs.project;
	}

	async run(attempt?: number) {
		if (!this.config) {
			throw new LoggingDataClass(
				LoggingLevels.error,
				'Cannot start without config',
			);
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
					= await this.convertColumnStringsToIDArray(
						this.config.enforceConventions.onColumn,
					);
				if (
					this.config.enforceConventions?.onColumn?.includes(
						this.context.props.column_id,
					)
				) {
					await this.conventions.enforce(this);
				}
			}

			if (this.config.labels) {
				await this.applyLabels(this).catch(error => {
					await log(LoggingLevels.error, 'Error applying labels' + String(error));
				});
			}

			// If (this.config.syncRemote && this.util.shouldRun("release"))
			// 	await this.syncRemoteProject(this).catch((err) => {
			// 		await log(LoggingLevels.error, "Error syncing remote project"+ err)
			// 	})
			core.endGroup();
		} catch (error) {
			if (attempt > this.retryLimit) {
				core.endGroup();
				throw log(
					LoggingLevels.emergency,
					'project actions failed. Terminating job.',
				);
			}

			await log(
				LoggingLevels.warn,
				`project Actions failed with "${error}", retrying in ${seconds} seconds....`,
			);

			attempt++;
			setTimeout(async () => {
				this.run(attempt);
			}, seconds * 1000);
		}
	}

	async convertColumnStringsToIDArray(columns: Column[]): Promise<number[]> {
		const columnList = await this.util.api.project.column.list(
			this.context.props.project.id,
		);
		return columns.map(column => {
			if (typeof column === 'string') {
				let columnID: number | undefined;
				for (const value of columnList) {
					if (value.name.toLowerCase() === column.toLowerCase()) {
						columnID = value.id;
					}
				}

				if (!columnID) {
					throw new LoggingDataClass(
						LoggingLevels.error,
						`${column} doesn't exist on this project`,
					);
				}

				return columnID;
			}

			return column;
		});
	}
}
