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
function run() {
    var _a, _b;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (localEx) {
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            local = yield Promise.resolve().then(() => tslib_1.__importStar(require('../config.json')));
            console.log(local);
            dryRun = (_a = local.GH_ACTION_LOCAL_TEST) !== null && _a !== void 0 ? _a : false;
            showLogs = (_b = local.SHOW_LOGS) !== null && _b !== void 0 ? _b : false;
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
                ? (yield Promise.resolve(`${local.configJson}`).then(s => tslib_1.__importStar(require(s))))
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
        const action = new action_js_1.default((0, github_1.getOctokit)(GITHUB_TOKEN), options);
        action.run().catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            (0, logging_js_1.log)(logging_js_1.LoggingLevels.emergency, `${String(node_process_1.default.env.NPM_PACKAGE_NAME)} did not complete due to error:`
                + String(error));
            throw error;
        }));
    });
}
run().catch((error) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    (0, logging_js_1.log)(logging_js_1.LoggingLevels.emergency, `${String(node_process_1.default.env.NPM_PACKAGE_NAME)} did not complete due to error:`
        + String(error));
    throw error;
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNDRzs7O0FBRUgsdURBQXVEO0FBQ3ZELDhEQUE4RDtBQUU5RCw4REFBeUI7QUFDekIscUVBQTBDO0FBQzFDLDREQUFzQztBQUN0Qyw0Q0FBMkM7QUFDM0MsNkNBQWdEO0FBQ2hELG9FQUFpQztBQUlqQyxNQUFNLE9BQU8sR0FBWSxpQkFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFBLGtCQUFHLEdBQUUsR0FBRyxjQUFjLENBQUMsQ0FBQztBQUMvRCxJQUFJLEtBQVUsQ0FBQztBQUNmLElBQUksTUFBZSxDQUFDO0FBQ3BCLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztBQUNyQixJQUFJLElBQXNCLENBQUM7QUFFM0I7Ozs7R0FJRztBQUNILFNBQWUsR0FBRzs7O1FBQ2pCLElBQUksT0FBTyxFQUFFO1lBQ1osYUFBYTtZQUNiLG1FQUFtRTtZQUNuRSxLQUFLLEdBQUcsZ0VBQWEsZ0JBQWdCLEdBQUMsQ0FBQztZQUN2QyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25CLE1BQU0sR0FBRyxNQUFBLEtBQUssQ0FBQyxvQkFBK0IsbUNBQUksS0FBSyxDQUFDO1lBQ3hELFFBQVEsR0FBRyxNQUFBLEtBQUssQ0FBQyxTQUFvQixtQ0FBSSxLQUFLLENBQUM7WUFDL0MsSUFBSSxHQUFHO2dCQUNOLElBQUksRUFBRSxLQUFLLENBQUMsaUJBQTJCO2dCQUN2QyxLQUFLLEVBQUUsS0FBSyxDQUFDLHVCQUFpQzthQUM5QyxDQUFDO1NBQ0Y7UUFFRCxJQUFJLE1BQU0sRUFBRTtZQUNYLElBQUEsZ0JBQUcsRUFDRiwwQkFBYSxDQUFDLE1BQU0sRUFDcEIsR0FBRyxNQUFNLENBQUMsc0JBQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsOERBQThELENBQ3JHLENBQUM7U0FDRjtRQUVELGdFQUFnRTtRQUNoRSxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFzQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBRTVGLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDbEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBQ3BDLE9BQU87U0FDUDtRQUVELE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwRSxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDNUUsTUFBTSxPQUFPLEdBQVk7WUFDeEIsVUFBVSxFQUFFLE9BQU87Z0JBQ2xCLENBQUMsQ0FBQyxDQUFDLHlCQUFhLEtBQUssQ0FBQyxVQUFVLCtDQUFDLENBQTBCO2dCQUMzRCxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUEwQjtZQUNuRSxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBb0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7WUFDMUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQW1CLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDO1lBQzNFLFFBQVE7WUFDUixNQUFNO1lBQ04sU0FBUztZQUNULFVBQVU7WUFDVixJQUFJO1lBQ0osR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQWEsQ0FBQyxDQUFDLENBQUMsU0FBUztTQUM5QyxDQUFDO1FBQ0YsTUFBTSxNQUFNLEdBQUcsSUFBSSxtQkFBTSxDQUFDLElBQUEsbUJBQVUsRUFBQyxZQUFZLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM3RCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQU8sS0FBWSxFQUFFLEVBQUU7WUFDekMsSUFBQSxnQkFBRyxFQUNGLDBCQUFhLENBQUMsU0FBUyxFQUN2QixHQUFHLE1BQU0sQ0FBQyxzQkFBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxpQ0FBaUM7a0JBQ3RFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FDZixDQUFDO1lBQ0YsTUFBTSxLQUFLLENBQUM7UUFDYixDQUFDLENBQUEsQ0FBQyxDQUFDOztDQUNIO0FBRUQsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQU8sS0FBWSxFQUFFLEVBQUU7SUFDbEMsSUFBQSxnQkFBRyxFQUNGLDBCQUFhLENBQUMsU0FBUyxFQUN2QixHQUFHLE1BQU0sQ0FBQyxzQkFBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxpQ0FBaUM7VUFDdEUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUNmLENBQUM7SUFDRixNQUFNLEtBQUssQ0FBQztBQUNiLENBQUMsQ0FBQSxDQUFDLENBQUMifQ==