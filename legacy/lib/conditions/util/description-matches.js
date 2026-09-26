"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: description-matches.ts
 * Path: \src\conditions\util\description-matches.ts
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
const type = 'descriptionMatches';
/** Checks if an issue or pull request's description matches a Regex condition.
@examples require(".").example
Example:

```json
{
    "type": "descriptionMatches",
    "condition": "foo.*bar"
}
``` */
async function descriptionMatches(pattern, context) {
    const condition = await this.util.parsingData.processRegExpcondition(pattern.condition);
    let test;
    if ('body' in context) {
        test = context.body;
    }
    else if ('issue' in context && 'body' in context.issue) {
        test = context.issue.body;
    }
    else if ('pull_request' in context && 'body' in context.pull_request) {
        test = context.pull_request.body;
    }
    if (!test) {
        return false;
    }
    // Log(LoggingLevels.debug, 'Running Test: ' + pattern.condition + ' on body:' + test + '\nresult: ' + String(condition.test(test)));
    return condition.test(test);
}
exports.default = [type, descriptionMatches];
exports.example = { type, condition: 'foo.*bar' };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVzY3JpcHRpb24tbWF0Y2hlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb25kaXRpb25zL3V0aWwvZGVzY3JpcHRpb24tbWF0Y2hlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHOzs7QUFLSCxNQUFNLElBQUksR0FBRyxvQkFBb0IsQ0FBQztBQU9sQzs7Ozs7Ozs7O01BU007QUFFTixLQUFLLFVBQVUsa0JBQWtCLENBRWhDLE9BQW9DLEVBQ3BDLE9BQTRDO0lBRTVDLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsc0JBQXNCLENBQ25FLE9BQU8sQ0FBQyxTQUFTLENBQ2pCLENBQUM7SUFFRixJQUFJLElBQUksQ0FBQztJQUNULElBQUksTUFBTSxJQUFJLE9BQU8sRUFBRTtRQUN0QixJQUFJLEdBQUcsT0FBTyxDQUFDLElBQWMsQ0FBQztLQUM5QjtTQUFNLElBQUksT0FBTyxJQUFJLE9BQU8sSUFBSSxNQUFNLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRTtRQUN6RCxJQUFJLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7S0FDMUI7U0FBTSxJQUFJLGNBQWMsSUFBSSxPQUFPLElBQUksTUFBTSxJQUFJLE9BQU8sQ0FBQyxZQUFZLEVBQUU7UUFDdkUsSUFBSSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDO0tBQ2pDO0lBRUQsSUFBSSxDQUFDLElBQUksRUFBRTtRQUNWLE9BQU8sS0FBSyxDQUFDO0tBQ2I7SUFFRCxxSUFBcUk7SUFFckksT0FBTyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdCLENBQUM7QUFFRCxrQkFBZSxDQUFDLElBQUksRUFBRSxrQkFBa0IsQ0FBVSxDQUFDO0FBQ3RDLFFBQUEsT0FBTyxHQUFnQyxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFDLENBQUMifQ==