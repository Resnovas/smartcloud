/**
 * Project: @resnovas/smartcloud
 * File: index.ts
 * Path: \src\index.ts
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

/* eslint-disable n/prefer-global/process */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import fs from 'node:fs';
import {cwd} from 'node:process';
import * as core from '@actions/core';
import {getOctokit} from '@actions/github';
import {LoggingLevels} from '@resnovas/utilities';
import {log} from './logging';
import Action from './action';
import type {Repo} from './utils';
import type {Options} from './types';

const localEx: boolean = fs.existsSync(cwd() + '/config.json');
let local: any;
let dryRun: boolean;
let showLogs = false;
let repo: Repo | undefined;

if (localEx) {
	// @ts-expect-error - This is a local run and config only exists when gulp is running
	local = await import('../config.json');
	dryRun = local.GH_ACTION_LOCAL_TEST ?? core.getInput('dryRun') ?? false;
	showLogs = local.SHOW_LOGS ?? false;
	repo = {
		repo: local.GITHUB_REPOSITORY,
		owner: local.GITHUB_REPOSITORY_OWNER,
	};
}

/**
 * Runs the action
 * @author TGTGamer
 * @since 1.0.0
 */
async function run() {
	if (dryRun) {
		await log(
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
			? await import(local.configJson) as Options['configJson']
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
	action.run().catch(async error => {
		await log(
			LoggingLevels.emergency,
			`${String(process.env.NPM_PACKAGE_NAME)} did not complete due to error:`
			+ String(error),
		);
	});
}

run().catch(async error => {
	await log(
		LoggingLevels.emergency,
		`${String(process.env.NPM_PACKAGE_NAME)} did not complete due to error:`
		+ String(error),
	);
});
