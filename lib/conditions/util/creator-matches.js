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
    if (!('sender' in context)) {
        throw new Error('No creator information to use');
    }
    return condition.test(context.sender.login);
}
exports.default = [type, creatorMatches];
exports.example = {
    type,
    condition: '^foo',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRvci1tYXRjaGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbmRpdGlvbnMvdXRpbC9jcmVhdG9yLW1hdGNoZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNDRzs7O0FBSUgsTUFBTSxJQUFJLEdBQUcsZ0JBQWdCLENBQUM7QUFPOUI7Ozs7Ozs7Ozs7R0FVRztBQUVILEtBQUssVUFBVSxjQUFjLENBRTVCLE9BQWdDLEVBQ2hDLE9BQWtCO0lBRWxCLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsc0JBQXNCLENBQ25FLE9BQU8sQ0FBQyxTQUFTLENBQ2pCLENBQUM7SUFFRixJQUFJLENBQUMsQ0FBQyxRQUFRLElBQUksT0FBTyxDQUFDLEVBQUU7UUFDM0IsTUFBTSxJQUFJLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0tBQ2pEO0lBRUQsT0FBTyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDN0MsQ0FBQztBQUVELGtCQUFlLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBVSxDQUFDO0FBQ2xDLFFBQUEsT0FBTyxHQUE0QjtJQUMvQyxJQUFJO0lBQ0osU0FBUyxFQUFFLE1BQU07Q0FDakIsQ0FBQyJ9