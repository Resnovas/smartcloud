"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/ban-ts-comment  */
/* eslint-disable @typescript-eslint/prefer-ts-expect-error */
const node_fs_1 = tslib_1.__importDefault(require("node:fs"));
const node_process_1 = tslib_1.__importStar(require("node:process"));
const core = tslib_1.__importStar(require("@actions/core"));
const github_1 = require("@actions/github");
const logging_js_1 = require("./logging.js");
const action_js_1 = tslib_1.__importDefault(require("./action.js"));
const localEx = node_fs_1.default.existsSync((0, node_process_1.cwd)() + '/config.json');
let local;
let dryRun;
let showLogs = false;
let repo;
/**
 * Runs the action
 * @author TGTGamer
 * @since 1.0.0
 */
async function run() {
    if (localEx) {
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        local = await Promise.resolve().then(() => tslib_1.__importStar(require('../config.json')));
        console.log(local);
        dryRun = local.GH_ACTION_LOCAL_TEST ?? false;
        showLogs = local.SHOW_LOGS ?? false;
        repo = {
            repo: local.GITHUB_REPOSITORY,
            owner: local.GITHUB_REPOSITORY_OWNER,
        };
    }
    if (dryRun) {
        (0, logging_js_1.log)(logging_js_1.LoggingLevels.notice, `${String(node_process_1.default.env.NPM_PACKAGE_NAME)} is running in local dryrun mode. No Actions will be applyed`);
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
            ? (await Promise.resolve(`${local.configJson}`).then(s => tslib_1.__importStar(require(s))))
            : (core.getInput('configJson') === ''
                ? undefined
                : JSON.parse(core.getInput('configJson'))),
        configPath: localEx ? local.configPath : core.getInput('config'),
        configRef: localEx ? local.configRef : core.getInput('configRef'),
        showLogs,
        dryRun,
        fillEmpty,
        skipDelete,
        repo,
        ref: localEx ? local.ref : undefined,
    };
    const action = new action_js_1.default((0, github_1.getOctokit)(GITHUB_TOKEN), options);
    action.run().catch(async (error) => {
        (0, logging_js_1.log)(logging_js_1.LoggingLevels.emergency, `${String(node_process_1.default.env.NPM_PACKAGE_NAME)} did not complete due to error:`
            + String(error));
        throw error;
    });
}
// eslint-disable-next-line unicorn/prefer-top-level-await
run().catch(async (error) => {
    (0, logging_js_1.log)(logging_js_1.LoggingLevels.emergency, `${String(node_process_1.default.env.NPM_PACKAGE_NAME)} did not complete due to error:`
        + String(error));
    throw error;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNDRzs7O0FBRUgsdURBQXVEO0FBQ3ZELDhEQUE4RDtBQUU5RCw4REFBeUI7QUFDekIscUVBQTBDO0FBQzFDLDREQUFzQztBQUN0Qyw0Q0FBMkM7QUFDM0MsNkNBQWdEO0FBQ2hELG9FQUFpQztBQUlqQyxNQUFNLE9BQU8sR0FBWSxpQkFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFBLGtCQUFHLEdBQUUsR0FBRyxjQUFjLENBQUMsQ0FBQztBQUMvRCxJQUFJLEtBQVUsQ0FBQztBQUNmLElBQUksTUFBZSxDQUFDO0FBQ3BCLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztBQUNyQixJQUFJLElBQXNCLENBQUM7QUFFM0I7Ozs7R0FJRztBQUNILEtBQUssVUFBVSxHQUFHO0lBQ2pCLElBQUksT0FBTyxFQUFFO1FBQ1osYUFBYTtRQUNiLG1FQUFtRTtRQUNuRSxLQUFLLEdBQUcsZ0VBQWEsZ0JBQWdCLEdBQUMsQ0FBQztRQUN2QyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25CLE1BQU0sR0FBRyxLQUFLLENBQUMsb0JBQStCLElBQUksS0FBSyxDQUFDO1FBQ3hELFFBQVEsR0FBRyxLQUFLLENBQUMsU0FBb0IsSUFBSSxLQUFLLENBQUM7UUFDL0MsSUFBSSxHQUFHO1lBQ04sSUFBSSxFQUFFLEtBQUssQ0FBQyxpQkFBMkI7WUFDdkMsS0FBSyxFQUFFLEtBQUssQ0FBQyx1QkFBaUM7U0FDOUMsQ0FBQztLQUNGO0lBRUQsSUFBSSxNQUFNLEVBQUU7UUFDWCxJQUFBLGdCQUFHLEVBQ0YsMEJBQWEsQ0FBQyxNQUFNLEVBQ3BCLEdBQUcsTUFBTSxDQUFDLHNCQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLDhEQUE4RCxDQUNyRyxD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