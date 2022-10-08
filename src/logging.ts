/* eslint-disable n/prefer-global/process */
/**
 * Project: @resnovas/smartcloud
 * File: logging.ts
 * Path: \src\logging.ts
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

import type {LoggingOptions, LogReturn, LoggingLevels} from '@resnovas/utilities';
import {Logger, LoggingDataClass} from '@resnovas/utilities';
import * as core from '@actions/core';
/**
 * Logging system used throughout the package.
 * @private
 */

const L = new Logger({
	logger: {
		console: {enabled: false},
		sentry: {
			enabled: Boolean(process.env.NPM_PACKAGE_SENTRY),
			config: {
				dsn: process.env.NPM_PACKAGE_SENTRY!,
			},
		},
	},
});
/**
 * Logging function used throught the package.
 * @private
 */
export async function log(
	name: LoggingLevels,
	message: string,
	options?: LoggingOptions,
): Promise<LogReturn> {
	const data = new LoggingDataClass(name, message, options);
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

	return L.log(data);
}
