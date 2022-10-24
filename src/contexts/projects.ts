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

import * as core from '@actions/core';
import type {Context} from '@actions/github/lib/context.js';
import type {ProjectCardEvent} from '@octokit/webhooks-types';
import type {Config, Runners, SharedConfig} from '../types.js';
import type {CurContext, ProjectContext, Version} from '../conditions/index.js';
import type {Utils} from '../utils/index.js';
import {log, LoggingLevels} from '../logging.js';
import {Contexts} from './methods/index.js';
import type {Column} from './methods/conventions.js';
import type {ProjectCreateBranch} from './methods/create-branch.js';
import type {Milestones} from './methods/handle-milestone.js';
import type {ExProjects} from './methods/sync-remote-project.js';

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
		const payload = context.payload as ProjectCardEvent;
		const project = payload.project_card;
		if (!project) {
			return;
		}

		log(
			LoggingLevels.debug,
			`context.payload.project_card: ${JSON.stringify(
				context.payload.project_card,
			)}`,
		);

		if (!project.content_url) {
			throw new Error('No content information to get');
		}

		const issueNumber = project.id;
		const issue = await utils.api.issues.get(issueNumber);

		const labels = await utils.parsingData
			.labels(issue.labels)
			.catch(async error => {
				throw new Error(log(LoggingLevels.error, 'Error thrown while parsing labels: ' + String(error)));
			});

		let currentVersion: Version | undefined;
		if (config.versioning) {
			currentVersion = await utils.versioning
				.parse(config, config.issue?.ref)
				.catch(async error => {
					throw new Error(log(
						LoggingLevels.error,
						'Error thrown while parsing versioning: ' + String(error),
					));
				});
		}

		const localProject = await utils.api.project.projects.get(project.id);

		const localColumn = await utils.api.project.column.get(project.column_id);

		const localCard = await utils.api.project.card.get(project.id);

		return {
			...context,
			currentVersion,

			// Todo: ask for advice on how to resolve
			// @ts-expect-error due to the range of possible types, it throws an error even though its fully populated
			props: {
				type: 'project',
				...project,
				project: localProject,
				localColumn,
				localCard,
				labels,
			},
		};
	}

	context: ProjectContext;
	config: ProjectConfig;
	// eslint-disable-next-line max-params
	constructor(
		util: Utils,
		runners: Runners,
		configs: Config,
		curContext: CurContext,
		dryRun: boolean,
	) {
		if (curContext.type !== 'project') {
			throw new Error(log(
				LoggingLevels.error,
				'Cannot construct without project context',
			));
		}

		super(util, runners, configs, curContext, dryRun);
		this.context = curContext.context;
		if (!configs.project) {
			throw new Error(log(
				LoggingLevels.error,
				'Cannot start without config',
			));
		}

		this.config = configs.project;
	}

	async run(attempt?: number) {
		if (!this.config) {
			throw new Error(log(
				LoggingLevels.error,
				'Cannot start without config',
			));
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
					= await this.convertColumnStringsToIdArray(
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
				await this.applyLabels(this).catch(async error => {
					throw new Error(log(LoggingLevels.error, 'Error applying labels' + String(error)));
				});
			}

			// If (this.config.syncRemote && this.util.shouldRun("release"))
			// 	await this.syncRemoteProject(this).catch((err) => {
			// 		await log(LoggingLevels.error, "Error syncing remote project"+ err)
			// 	})
			core.endGroup();
		} catch (error: unknown) {
			if (attempt > this.retryLimit) {
				core.endGroup();
				throw new Error(log(
					LoggingLevels.emergency,
					'project actions failed. Terminating job.',
				));
			}

			log(
				LoggingLevels.warn,
				`project Actions failed with "${String(error)}", retrying in ${seconds} seconds....`,
			);

			attempt++;
			setTimeout(async () => {
				await this.run(attempt);
			}, seconds * 1000);
		}
	}

	async convertColumnStringsToIdArray(columns: Column[]): Promise<number[]> {
		const columnList = await this.util.api.project.column.list(
			this.context.props.project.id,
		);
		return columns.map(column => {
			if (typeof column === 'string') {
				let columnId: number | undefined;
				for (const value of columnList) {
					if (value.name.toLowerCase() === column.toLowerCase()) {
						columnId = value.id;
					}
				}

				if (!columnId) {
					throw new Error(log(
						LoggingLevels.error,
						`${column} doesn't exist on this project`,
					));
				}

				return columnId;
			}

			return column;
		});
	}
}
