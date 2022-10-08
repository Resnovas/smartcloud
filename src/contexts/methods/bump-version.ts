/**
 * Project: @resnovas/smartcloud
 * File: bump-version.ts
 * Path: \src\contexts\methods\bump-version.ts
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

import {LoggingLevels} from '@resnovas/utilities';
import type {PullRequests} from '..';
import {log} from '../../logging';

export async function bumpVersion(this: PullRequests) {
	const labels = this.config.manageRelease?.labels;
	if (!labels || !this.context.props.labels) {
		return;
	}

	if (
		(!this.configs.versioning || this.configs.versioning.type === 'SemVer')
		&& this.newVersion?.semantic
	) {
		if (
			this.context.props.labels[labels.major] || labels.breaking
				? this.context.props.labels[labels.major]
				: true
		) {
			this.newVersion.semantic.major++;
		} else if (this.context.props.labels[labels.minor]) {
			this.newVersion.semantic.minor++;
		} else if (this.context.props.labels[labels.patch]) {
			this.newVersion.semantic.patch++;
		}

		if (this.context.props.labels[labels.prerelease]) {
			this.newVersion.semantic.prerelease
				= this.newVersion.semantic.prerelease
				|| this.configs.versioning?.prereleaseName
				|| 'prerelease';
		}

		if (this.context.props.labels[labels.build]) {
			this.newVersion.semantic.build = +1;
		}

		this.newVersion.name = `${this.newVersion.semantic.major}.${this.newVersion.semantic.minor
		}.${this.newVersion.semantic.patch}${this.newVersion.semantic.prerelease
			? `-${this.newVersion.semantic.prerelease}`
			: ''
		}${this.newVersion.semantic.build ? `+${this.newVersion.semantic.build}` : ''
		}`;
		log(LoggingLevels.debug, `New Version is: ${this.newVersion.name}`);
	}
}
