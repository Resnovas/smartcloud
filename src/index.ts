/*
 * Project: @resnovas/smartcloud
 * File: index.ts
 * Path: \src\index.ts
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
 * Last Modified: 24-10-2022
 * By: Jonathan Stevens (Email: jonathan@resnovas.com, Github: https://github.com/TGTGamer)
 * Current Version: 1.0.0-beta.0
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */

/* eslint-disable @typescript-eslint/ban-ts-comment  */
/* eslint-disable @typescript-eslint/prefer-ts-expect-error */

import fs from 'node:fs';
import process, {cwd} from 'node:process';
import * as core from '@actions/core';
import {getOctokit} from '@actions/github';
import {log, LoggingLevels} from './logging.js';
import Action from './action.js';
import type {Repo} from './utils/index.js';
import type {Options} from './types.js';

const localEx: boolean = fs.existsSync(cwd() + '/config.json');
let local: any;
let dryRun: boolean;
let showLogs = false;
let repo: Repo | undefined;

/**
 * Runs the action
 * @author TGTGamer
 * @since 1.0.0
 */
async function run() {
	if (localEx) {
		// @ts-ignore
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		local = await import('../config.json');
		console.log(local);
		dryRun = local.GH_ACTION_LOCAL_TEST as boolean ?? false;
		showLogs = local.SHOW_LOGS as boolean ?? false;
		repo = {
			repo: local.GITHUB_REPOSITORY as string,
			owner: local.GITHUB_REPOSITORY_OWNER as string,
		};
	}

	if (dryRun) {
		log(
			LoggingLevels.notice,
			`${String(process.env.NPM_PACKAGE_NAME)} is running in local dryrun mode. No Actions will be applyed`,
		);
	}

	// eslint-disable-next-line @typescript-eslint/naming-convention
	const GITHUB_TOKEN = localEx ? local.GITHUB_TOKEN as string : core.getInput('GITHUB_TOKEN');

	if (!GITHUB_TOKEN) {
		core.setFailed('No Token provided');
		return;
	}

	const fillEmpty = Boolean(core.getInput('fillEmpty') || local.FILL);
	const skipDelete = Boolean(core.getInput('skipDelete') || local.SKIPDELETE);
	const options: Options = {
		configJson: localEx
			? (await import(local.configJson)) as Options['configJson']
			: JSON.parse(core.getInput('configJson')) as Options['configJson'],
		configPath: localEx ? local.configPath as string : core.getInput('config'),
		configRef: localEx ? local.configRef as string : core.getInput('configRef'),
		showLogs,
		dryRun,
		fillEmpty,
		skipDelete,
		repo,
		ref: localEx ? local.ref as string : undefined,
	};
	const action = new Action(getOctokit(GITHUB_TOKEN), options);
	action.run().catch(async (error: Error) => {
		log(
			LoggingLevels.emergency,
			`${String(process.env.NPM_PACKAGE_NAME)} did not complete due to error:`
			+ String(error),
		);
		throw error;
	});
}

run().catch(async (error: Error) => {
	log(
		LoggingLevels.emergency,
		`${String(process.env.NPM_PACKAGE_NAME)} did not complete due to error:`
		+ String(error),
	);
	throw error;
});
