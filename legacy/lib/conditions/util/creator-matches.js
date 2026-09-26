"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: creator-matches.ts
 * Path: \src\conditions\util\creator-matches.ts
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.example = void 0;
const tslib_1 = require("tslib");
const logging_js_1 = tslib_1.__importStar(require("../../logging.js"));
const type = 'creatorMatches';
/** Checks if an issue or pull request's creator's username matches a Regex condition.

Example:
@examples require(".").example
```json
{
    "type": "creatorMatches",
    "condition": "^foo"
}
```
 */
async function creatorMatches(pattern, context) {
    const condition = await this.util.parsingData.processRegExpcondition(pattern.condition);
    if ('user' in context && context.user !== null) {
        (0, logging_js_1.default)(logging_js_1.LoggingLevels.debug, 'Running Test: ' + pattern.condition + ' on user: ' + context.user.login + ' \nresult: ' + String(condition.test(context.user.login)));
        return condition.test(context.user.login);
    }
    throw new Error('No creator information to use');
}
exports.default = [type, creatorMatches];
exports.example = {
    type,
    condition: '^foo',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRvci1tYXRjaGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbmRpdGlvbnMvdXRpbC9jcmVhdG9yLW1hdGNoZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNDRzs7OztBQUVILHVFQUFvRDtBQUdwRCxNQUFNLElBQUksR0FBRyxnQkFBZ0IsQ0FBQztBQU85Qjs7Ozs7Ozs7OztHQVVHO0FBRUgsS0FBSyxVQUFVLGNBQWMsQ0FFNUIsT0FBZ0MsRUFDaEMsT0FBa0I7SUFFbEIsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FDbkUsT0FBTyxDQUFDLFNBQVMsQ0FDakIsQ0FBQztJQUVGLElBQUksTUFBTSxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRTtRQUMvQyxJQUFBLG9CQUFHLEVBQUMsMEJBQWEsQ0FBQyxLQUFLLEVBQUUsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLFNBQVMsR0FBRyxZQUFZLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsYUFBYSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hLLE9BQU8sU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQzFDO0lBRUQsTUFBTSxJQUFJLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0FBQ2xELENBQUM7QUFFRCxrQkFBZSxDQUFDLElBQUksRUFBRSxjQUFjLENBQVUsQ0FBQztBQUNsQyxRQUFBLE9BQU8sR0FBNEI7SUFDL0MsSUFBSTtJQUNKLFNBQVMsRUFBRSxNQUFNO0NBQ2pCLENBQUMifQ==