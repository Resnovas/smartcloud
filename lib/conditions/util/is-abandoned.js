"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: is-abandoned.ts
 * Path: \src\conditions\util\is-abandoned.ts
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
 * Last Modified: 25-10-2022
 * By: Jonathan Stevens (Email: jonathan@resnovas.com, Github: https://github.com/TGTGamer)
 * Current Version: 1.0.0-beta.0
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.example = void 0;
const type = 'isAbandoned';
/** Checks if an issue or pull request is abandoned.

Example:
@examples require(".").example
```json
{
    "type": "isAbandoned",
    "condition": 30
}
``` */
function isAbandoned(condition, context) {
    let test;
    if ('updated_at' in context) {
        test = context.updated_at;
    }
    else if ('issue' in context && 'updated_at' in context.issue) {
        test = context.issue.updated_at;
    }
    else if ('pull_request' in context && 'updated_at' in context.pull_request) {
        test = context.pull_request.updated_at;
    }
    if (!test) {
        return false;
    }
    const last = new Date(test);
    last.setDate(last.getDate() + condition.condition);
    const now = new Date();
    return last >= now;
}
exports.default = [type, isAbandoned];
exports.example = { type, condition: 30, label: 'abandoned' };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXMtYWJhbmRvbmVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbmRpdGlvbnMvdXRpbC9pcy1hYmFuZG9uZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNDRzs7O0FBSUgsTUFBTSxJQUFJLEdBQUcsYUFBYSxDQUFDO0FBUTNCOzs7Ozs7Ozs7TUFTTTtBQUVOLFNBQVMsV0FBVyxDQUVuQixTQUErQixFQUMvQixPQUFrQjtJQUVsQixJQUFJLElBQUksQ0FBQztJQUNULElBQUksWUFBWSxJQUFJLE9BQU8sRUFBRTtRQUM1QixJQUFJLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQztLQUMxQjtTQUFNLElBQUksT0FBTyxJQUFJLE9BQU8sSUFBSSxZQUFZLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRTtRQUMvRCxJQUFJLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUM7S0FDaEM7U0FBTSxJQUFJLGNBQWMsSUFBSSxPQUFPLElBQUksWUFBWSxJQUFJLE9BQU8sQ0FBQyxZQUFZLEVBQUU7UUFDN0UsSUFBSSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDO0tBQ3ZDO0lBRUQsSUFBSSxDQUFDLElBQUksRUFBRTtRQUNWLE9BQU8sS0FBSyxDQUFDO0tBQ2I7SUFFRCxNQUFNLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDbkQsTUFBTSxHQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUN2QixPQUFPLElBQUksSUFBSSxHQUFHLENBQUM7QUFDcEIsQ0FBQztBQUVELGtCQUFlLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBVSxDQUFDO0FBQy9CLFFBQUEsT0FBTyxHQUF5QixFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUMsQ0FBQyJ9