/*
 * Project: @resnovas/smartcloud
 * File: logging.ts
 * Path: \src\logging.ts
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

export enum LoggingLevels {
	unknown = 0, // The log entry has no assigned severity level.
	debug = 100, //  Debug or trace information.
	info = 200, //  Routine information, such as ongoing status or performance.
	notice = 300, //  Normal but significant events, such as start up, shut down, or a configuration change.
	warn = 400, //  Warning events might cause problems.
	error = 500, //  Error events are likely to cause problems.
	critical = 600, //  Critical events cause more severe problems or outages.
	alert = 700, //  A person must take an action immediately.
	emergency = 800, //  One or more systems are unusable.
}

/**
 * Logging function used throught the package.
 */
export function log(
	name: LoggingLevels,
	message: string,
) {
	const type = Number(name) / 100;
	if (type === 1) {
		core.debug(message);
	} else if (type < 4) {
		core.info(message);
	} else if (type === 4) {
		core.warning(message);
	} else if (type < 7) {
		core.error(message);
	} else {
		core.setFailed(message);
	}

	return message;
}

export default log;
