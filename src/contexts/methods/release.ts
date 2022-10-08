/**
 * Project: @resnovas/smartcloud
 * File: release.ts
 * Path: \src\contexts\methods\release.ts
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

import type {PrConditionConfig} from '../../conditions';
import type {Changelog} from './changelog';
import type {CreateMilestone} from './handle-milestone';

/**
 * The release configuration
 */
export type Release = {
	/**
	 * The labels to use to detect release type (semantic release)
	 */
	labels?: {
		/**
		 * The label to use to mark a build
		 */
		build: string;
		/**
		 * The label to use to mark a prerelease
		 */
		prerelease: string;
		/**
		 * The label to use to mark a patch
		 */
		patch: string;
		/**
		 * The label to use to mark a minor
		 */
		minor: string;
		/**
		 * The label to use to mark a major
		 */
		major: string;

		/**
		 * The label to use to mark a breaking change
		 */
		breaking?: string;
	};
	/**
	 * Should the release create a tag?
	 */
	createTag?: boolean;
	/**
	 * Should the release create a Github Release?
	 */
	createRelease?: CreateRelease;
	/**
	 * Should the release create the next milestone?
	 */
	createMilestone?: CreateMilestone;
	/**
	 * Should the release create a Github Package?
	 */
	createPackages?: string[] | string;
	/**
	 * Should the release create a changelog?
	 */
	createChangelog?: Changelog;
} & PrConditionConfig;

/**
 *
 */
export type ReleaseChanges = {
	/**
	 * Should include issues?
	 */
	includeIssues?: boolean;
	/**
	 * The section configuration
	 */
	sections?: Sections[];
};

/**
 * The section configuration
 */
export type Sections = {
	/**
	 * The title of this section
	 */
	title: string;
	/**
	 * The body of this section
	 */
	body?: string;
	/**
	 * The pull request labels to include
	 */
	PRlabels: string[];
	/**
	 * The issue labels to include
	 */
	issueLabels?: string[];
	/**
	 *  Should include the committer username?
	 */
	includeCommitter?: boolean;
	/**
	 * Should link the Pull Request?
	 */
	linkPR?: boolean;
};

/**
 * The create release configuration
 */
export type CreateRelease = {
	/**
	 * The name of the tag to create
	 */
	tagName?: string;
	/**
	 * The prefix before the tagName
	 */
	tagPrefix?: string;
	/**
	 * The name of the release to create
	 */
	releaseName?: string;
	/**
	 * The prefix before the releaseName
	 */
	releaseNamePrefix?: string;
	/**
	 * The sufix to add to the release name
	 */
	releaseNameSuffix?: string;
	/**
	 * Should be a draft?
	 */
	draft?: boolean;
	/**
	 * Should release be a prerelease?
	 */
	prerelease?: boolean;
	/**
	 * Should the release use the generated changelog?
	 */
	useChangelog?: boolean;
} & ReleaseChanges;
