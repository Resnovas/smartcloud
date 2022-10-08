/**
 * Project: @resnovas/smartcloud
 * File: types.ts
 * Path: \src\types.ts
 * Created Date: Sunday, September 25th 2022
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
import type {GitHub} from '@actions/github/lib/utils';
import type {SimpleGitOptions} from 'simple-git';
import type {
	IssueConditionConfig,
	PrConditionConfig,
	ProjectConditionConfig,
	ScheduleConditionConfig,
	SharedConditions,
} from './conditions';
import type {
	IssueConfig,
	ProjectConfig,
	PullRequestConfig,
	ScheduleConfig,
} from './contexts';

import type {Stale} from './contexts/methods/check-stale';
import type {EnforceConventions} from './contexts/methods/conventions';
import type {Repo} from './utils';

/**
 * The application options used within Github Actions workflows
 */
export type Options = {
	/**
	 * The path to find the config
	 */
	configPath?: string;
	/**
	 * The json configuration object
	 */
	configJson?: Runners;
	/**
	 * The ref to use when retrieving config
	 */
	configRef?: string;
	/**
	 * Should show logs?
	 */
	showLogs: boolean;
	/**
	 * Should dry run?
	 */
	dryRun: boolean;
	/**
	 * Should fill empty values?
	 */
	fillEmpty: boolean;
	/**
	 * Should skip delete of labels
	 */
	skipDelete: boolean;
	/**
	 * The repo to use
	 */
	repo?: Repo;
	/**
	 * The Git settings to use
	 */
	git?: SimpleGitOptions;
	/**
	 * The ref to use
	 */
	ref?: string;
};

export type Runners = {
	/**
	 * Declaritively specify which schema you want to use. This defaults to our latest schema specified at: https://raw.githubusercontent.com/resnovas/smartcloud/main/schema.json
	 * @default https://raw.githubusercontent.com/resnovas/smartcloud/main/schema.json
	 */
	$schema: string;
	/**
	 * Declaritively specify all the labels that shuold exist in this repository, and initialise them.
	 * You will use the names specified here later to apply these same labels to issues and pull requests.
	 */
	labels?: Labels;
	/**
	 * This defines all the diffent configurations for your repository.
	 * You can have as many as you like. You can use this within Mono-repositories to have different configurations for different projects.
	 * You can also have diffeent configurations for different branches.
	 */
	runners: Config[];
};

export type Config = {
	/**
	 * The branch used to get the config file from. Defaults to master.
	 */
	branch?: string;
	/**
	 * Versioning configuration used for release management.
	 */
	versioning?: {
		/**
		 * Version source used to determine the version.
		 */
		source: VersionSource;
		/**
		 * Version Type to change how versioning is handled.
		 */
		type?: VersionType;
		/**
		 * If version is a pre-release, this is the version name to use.
		 */
		prereleaseName?: string;
	};
	/**
	 * Maximum number of attempts before stopping.
	 * @default 3
	 */
	retryLimit?: number;
	/**
	 * The labels used by our internal tools.
	 * @private
	 */
	labels?: Record<string, string>;
	/**
	 * Shared configurations, merged with the PR, Issue, Project and Schedule configurations.
	 */
	sharedConfig?: SharedConfig;
	/**
	 * The pull request configurations.
	 */
	pr?: PullRequestConfig;
	/**
	 * The issue configurations.
	 */
	issue?: IssueConfig;
	/**
	 * The project configurations.
	 */
	project?: ProjectConfig;
	/**
	 * The schedule configurations.
	 */
	schedule?: ScheduleConfig;
};

/**
 * The shared configuration Index
 * @private
 */
export type SharedConfigIndex =
	| 'ref'
	| 'enforceConventions'
	| 'labels'
	| 'stale';

/**
 * The shared configuration
 */
export type SharedConfig = {
	/**
	 * The reference used internally
	 */
	ref?: string;
	/**
	 * 	The enforceConventions configuration
	 */
	enforceConventions?: EnforceConventions;
	/**
	 *	The stale configuration
	 */
	stale?: Stale;
	/**
	 * The labels to be applied
	 */
	labels?: Record<
	string,
	| IssueConditionConfig
	| ProjectConditionConfig
	| PrConditionConfig
	| ScheduleConditionConfig
	| SharedConditions
	>;
};

/**
 * The labels configuration.
 * @param name The name as appears on github
 * @param description A description of the label
 * @param color The color of the label
 */
export type Label = {
	/**
	 * The name as appears on github
	 */
	name: string;
	/**
	 * A description of the label
	 */
	description?: string;
	/**
	 * The color of the label
	 */
	color: string;
};

/**
 *	An array of labels.
 */
export type Labels = Record<string, Label>;
/**
 * The version source.
 * Node: A node project, our package will use the package.json to determine the version.
 * Milestones: Utilises the Github Milestone API to determine the version.
 * String: A string to use as the version.
 */
export type VersionSource = 'node' | 'milestones';

/**
 * The version number type. This is used to determine how versioning is handled. SemVer is the default.
 */
export type VersionType = 'semVer';

export type Github = InstanceType<typeof GitHub>;
