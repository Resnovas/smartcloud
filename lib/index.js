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
/* eslint-disable unicorn/no-await-expression-member */
import fs from 'node:fs';
import process, { cwd } from 'node:process';
import * as core from '@actions/core';
import { getOctokit } from '@actions/github';
import { log, LoggingLevels } from './logging.js';
import Action from './action.js';
const localEx = fs.existsSync(cwd() + '/config.json');
let local;
let dryRun;
let showLogs = false;
let repo;
if (localEx) {
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error, @typescript-eslint/ban-ts-comment
    // @ts-ignore
    local = (await import('../config.json', { assert: { type: 'json' } })).default;
    dryRun = local.GH_ACTION_LOCAL_TEST ?? false;
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
        log(LoggingLevels.notice, `${String(process.env.NPM_PACKAGE_NAME)} is running in local dryrun mode. No Actions will be applyed`);
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const GITHUB_TOKEN = localEx ? local.GITHUB_TOKEN : core.getInput('GITHUB_TOKEN');
    if (!GITHUB_TOKEN) {
        core.setFailed('No Token provided');
        return;
    }
    const fillEmpty = Boolean(core.getInput('fillEmpty') || local.FILL);
    const skipDelete = Boolean(core.getInput('skipDelete') || local.SKIPDELETE);
    const options = {
        configJson: localEx
            ? (await import(local.configJson, { assert: { type: 'json' } })).default
            : JSON.parse(core.getInput('configJson')),
        configPath: localEx ? local.configPath : core.getInput('config'),
        configRef: localEx ? local.configRef : core.getInput('configRef'),
        showLogs,
        dryRun,
        fillEmpty,
        skipDelete,
        repo,
        ref: localEx ? local.ref : undefined,
    };
    const action = new Action(getOctokit(GITHUB_TOKEN), options);
    action.run().catch(async (error) => {
        throw new Error(log(LoggingLevels.emergency, `${String(process.env.NPM_PACKAGE_NAME)} did not complete due to error:`
            + String(error)));
    });
}
run().catch(async (error) => {
    throw new Error(log(LoggingLevels.emergency, `${String(process.env.NPM_PACKAGE_NAME)} did not complete due to error:`
        + String(error)));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHO0FBRUgsdURBQXVEO0FBRXZELE9BQU8sRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUN6QixPQUFPLE9BQU8sRUFBRSxFQUFDLEdBQUcsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUMxQyxPQUFPLEtBQUssSUFBSSxNQUFNLGVBQWUsQ0FBQztBQUN0QyxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDM0MsT0FBTyxFQUFDLEdBQUcsRUFBRSxhQUFhLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDaEQsT0FBTyxNQUFNLE1BQU0sYUFBYSxDQUFDO0FBSWpDLE1BQU0sT0FBTyxHQUFZLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUcsY0FBYyxDQUFDLENBQUM7QUFDL0QsSUFBSSxLQUFVLENBQUM7QUFDZixJQUFJLE1BQWUsQ0FBQztBQUNwQixJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7QUFDckIsSUFBSSxJQUFzQixDQUFDO0FBRTNCLElBQUksT0FBTyxFQUFFO0lBQ1osd0dBQXdHO0lBQ3hHLGFBQWE7SUFDYixLQUFLLEdBQUcsQ0FBQyxNQUFNLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxFQUFDLE1BQU0sRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7SUFDM0UsTUFBTSxHQUFHLEtBQUssQ0FBQyxvQkFBK0IsSUFBSSxLQUFLLENBQUM7SUFDeEQsUUFBUSxHQUFHLEtBQUssQ0FBQyxTQUFvQixJQUFJLEtBQUssQ0FBQztJQUMvQyxJQUFJLEdBQUc7UUFDTixJQUFJLEVBQUUsS0FBSyxDQUFDLGlCQUEyQjtRQUN2QyxLQUFLLEVBQUUsS0FBSyxDQUFDLHVC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