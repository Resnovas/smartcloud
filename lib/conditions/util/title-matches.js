"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: title-matches.ts
 * Path: \src\conditions\util\title-matches.ts
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
const type = 'titleMatches';
/** Checks if an issue or pull request's title matches a Regex condition.
@examples require(".").example
Example:

```json
{
    "type": "titleMatches",
    "condition": "^foo"
}
```
 */
async function titleMatches(pattern, context) {
    let test;
    if ('title' in context) {
        test = context.title;
    }
    else if ('issue' in context && 'title' in context.issue) {
        test = context.issue.title;
    }
    else if ('pull_request' in context && 'title' in context.pull_request) {
        test = context.pull_request.title;
    }
    if (!test) {
        return false;
    }
    const condition = await this.util.parsingData.processRegExpcondition(pattern.condition);
    // Log(LoggingLevels.debug, 'Running Test: ' + pattern.condition + ' on title:' + test + '\nresult: ' + String(condition.test(test)));
    return condition.test(test);
}
exports.default = [type, titleMatches];
exports.example = { type, condition: '^foo' };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGl0bGUtbWF0Y2hlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb25kaXRpb25zL3V0aWwvdGl0bGUtbWF0Y2hlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHOzs7QUFLSCxNQUFNLElBQUksR0FBRyxjQUFjLENBQUM7QUFPNUI7Ozs7Ozs7Ozs7R0FVRztBQUVILEtBQUssVUFBVSxZQUFZLENBRTFCLE9BQThCLEVBQzlCLE9BQWtCO0lBRWxCLElBQUksSUFBSSxDQUFDO0lBQ1QsSUFBSSxPQUFPLElBQUksT0FBTyxFQUFFO1FBQ3ZCLElBQUksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO0tBQ3JCO1NBQU0sSUFBSSxPQUFPLElBQUksT0FBTyxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFO1FBQzFELElBQUksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztLQUMzQjtTQUFNLElBQUksY0FBYyxJQUFJLE9BQU8sSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLFlBQVksRUFBRTtRQUN4RSxJQUFJLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7S0FDbEM7SUFFRCxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQ1YsT0FBTyxLQUFLLENBQUM7S0FDYjtJQUVELE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsc0JBQXNCLENBQ25FLE9BQU8sQ0FBQyxTQUFTLENBQ2pCLENBQUM7SUFFRixzSUFBc0k7SUFFdEksT0FBTyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdCLENBQUM7QUFFRCxrQkFBZSxDQUFDLElBQUksRUFBRSxZQUFZLENBQVUsQ0FBQztBQUNoQyxRQUFBLE9BQU8sR0FBMEIsRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBQyxDQUFDIn0=