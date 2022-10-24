/*
 * Project: @resnovas/smartcloud
 * File: versioning.ts
 * Path: \src\utils\versioning.ts
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

import path from 'node:path';
import {log, LoggingLevels} from '../logging.js';
import type {Config} from '../types.js';
import type {Version} from '../conditions/index.js';
import type {Utils} from './index.js';

/**
 * Gets the version information
 * @author IvanFon, TGTGamer
 * @since 1.0.0
 */
export async function parse(
	this: Utils,
	config: Config,
	ref?: string,
): Promise<Version> {
	let rawVersion;
	if (!config.branch) {
		config.branch = 'master';
	}

	if (config.versioning?.source === 'node') {
		rawVersion = await getNodeVersion
			.call(this, config.branch, ref)
			.catch(async error => {
				throw new Error(log(
					LoggingLevels.error,
					'Error thrown while parsing node project: ' + String(error),
				));
			});
	} else if (config.versioning?.source === 'milestones') {
		// Todo: Add milestone passing
	} else if (config.versioning?.source) {
		rawVersion = config.versioning.source;
	} else {
		throw new Error('There isn\'t any version to use');
	}

	if (!rawVersion) {
		rawVersion = '0.0.0';
	}

	if (config.versioning?.type === 'semVer' || !config.versioning.type) {
		const semVer = rawVersion.split('.');
		const plus = semVer[2]?.split('+');
		const patch = plus?.[0]?.split('-')?.[0];
		if (!semVer || !semVer[0] || !semVer[1] || !semVer[2] || !patch) {
			throw new Error('semVer versioning is not valid');
		}

		const versioning: Version['semantic'] = {
			major: Number(semVer[0]),
			minor: Number(semVer[1]),
			patch: Number(patch),
			prerelease: rawVersion.split('-')?.[1]?.split('+')?.[0],
			build: plus?.[1] ? Number(plus[1]) : undefined,
		};
		return {semantic: versioning};
	}

	return {name: rawVersion};
}

export async function getNodeVersion(
	this: Utils,
	root: string,
	ref?: string,
): Promise<string> {
	const file = path.join(root, '/package.json');
	log(LoggingLevels.debug, `Getting file: ${file}`);
	return JSON.parse(await this.api.files.get(file, ref)).version as string;
}
