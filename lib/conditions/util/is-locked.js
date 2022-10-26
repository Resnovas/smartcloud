"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: is-locked.ts
 * Path: \src\conditions\util\is-locked.ts
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
const type = 'isLocked';
/** Checks if an issue or pull request is locked.

Example:
@examples require(".").example
```json
{
    "type": "isLocked",
    "condition": true
}
``` */
function isLocked(condition, context) {
    let test;
    if ('locked' in context) {
        test = context.locked;
    }
    else if ('issue' in context && 'locked' in context.issue) {
        test = context.issue.locked;
    }
    else if ('pull_request' in context && 'locked' in context.pull_request) {
        test = context.pull_request.locked;
    }
    return condition.condition === test;
}
exports.default = [type, isLocked];
exports.example = { type, condition: true };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXMtbG9ja2VkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbmRpdGlvbnMvdXRpbC9pcy1sb2NrZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNDRzs7O0FBSUgsTUFBTSxJQUFJLEdBQUcsVUFBVSxDQUFDO0FBT3hCOzs7Ozs7Ozs7TUFTTTtBQUVOLFNBQVMsUUFBUSxDQUVoQixTQUE0QixFQUM1QixPQUFrQjtJQUVsQixJQUFJLElBQUksQ0FBQztJQUNULElBQUksUUFBUSxJQUFJLE9BQU8sRUFBRTtRQUN4QixJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztLQUN0QjtTQUFNLElBQUksT0FBTyxJQUFJLE9BQU8sSUFBSSxRQUFRLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRTtRQUMzRCxJQUFJLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7S0FDNUI7U0FBTSxJQUFJLGNBQWMsSUFBSSxPQUFPLElBQUksUUFBUSxJQUFJLE9BQU8sQ0FBQyxZQUFZLEVBQUU7UUFDekUsSUFBSSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO0tBQ25DO0lBRUQsT0FBTyxTQUFTLENBQUMsU0FBUyxLQUFLLElBQUksQ0FBQztBQUNyQyxDQUFDO0FBRUQsa0JBQWUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFVLENBQUM7QUFDNUIsUUFBQSxPQUFPLEdBQXNCLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUMsQ0FBQyJ9