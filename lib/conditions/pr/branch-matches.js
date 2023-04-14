"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: branch-matches.ts
 * Path: \src\conditions\pr\branch-matches.ts
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
const type = 'branchMatches';
/** Checks if branch name matches a Regex condition.

    @examples require(".").example

    Example:

```json
{
    "type": "branchMatches",
    "condition": "^bugfix\\/"
}
``` */
function branchMatches(pattern, context) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const condition = yield this.util.parsingData.processRegExpcondition(pattern.condition);
        return condition.test(context.pull_request.head.ref);
    });
}
exports.default = [type, branchMatches];
exports.example = {
    type,
    condition: '^bugfix\\/',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJhbmNoLW1hdGNoZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29uZGl0aW9ucy9wci9icmFuY2gtbWF0Y2hlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHOzs7O0FBS0gsTUFBTSxJQUFJLEdBQUcsZUFBZSxDQUFDO0FBTzdCOzs7Ozs7Ozs7OztNQVdNO0FBQ04sU0FBZSxhQUFhLENBRTNCLE9BQStCLEVBQy9CLE9BQWdCOztRQUVoQixNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUNuRSxPQUFPLENBQUMsU0FBUyxDQUNqQixDQUFDO1FBQ0YsT0FBTyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3RELENBQUM7Q0FBQTtBQUVELGtCQUFlLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBVSxDQUFDO0FBRWpDLFFBQUEsT0FBTyxHQUEyQjtJQUM5QyxJQUFJO0lBQ0osU0FBUyxFQUFFLFlBQVk7Q0FDdkIsQ0FBQyJ9