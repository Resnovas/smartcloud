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
const tslib_1 = require("tslib");
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
function descriptionMatches(pattern, context) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const condition = yield this.util.parsingData.processRegExpcondition(pattern.condition);
        let test;
        switch (context.type) {
            case 'issue':
                test = context.issue.body;
                break;
            case 'pr':
                test = context.pull_request.body;
                break;
            default:
                break;
        }
        if (!test) {
            return false;
        }
        return condition.test(test);
    });
}
exports.default = [type, descriptionMatches];
exports.example = { type, condition: 'foo.*bar' };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVzY3JpcHRpb24tbWF0Y2hlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb25kaXRpb25zL3V0aWwvZGVzY3JpcHRpb24tbWF0Y2hlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHOzs7O0FBSUgsTUFBTSxJQUFJLEdBQUcsb0JBQW9CLENBQUM7QUFPbEM7Ozs7Ozs7OztNQVNNO0FBRU4sU0FBZSxrQkFBa0IsQ0FFaEMsT0FBb0MsRUFDcEMsT0FBNEM7O1FBRTVDLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsc0JBQXNCLENBQ25FLE9BQU8sQ0FBQyxTQUFTLENBQ2pCLENBQUM7UUFFRixJQUFJLElBQUksQ0FBQztRQUNULFFBQVEsT0FBTyxDQUFDLElBQUksRUFBRTtZQUNyQixLQUFLLE9BQU87Z0JBQ1gsSUFBSSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO2dCQUMxQixNQUFNO1lBQ1AsS0FBSyxJQUFJO2dCQUNSLElBQUksR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQztnQkFDakMsTUFBTTtZQUNQO2dCQUNDLE1BQU07U0FDUDtRQUVELElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDVixPQUFPLEtBQUssQ0FBQztTQUNiO1FBRUQsT0FBTyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzdCLENBQUM7Q0FBQTtBQUVELGtCQUFlLENBQUMsSUFBSSxFQUFFLGtCQUFrQixDQUFVLENBQUM7QUFDdEMsUUFBQSxPQUFPLEdBQWdDLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUMsQ0FBQyJ9