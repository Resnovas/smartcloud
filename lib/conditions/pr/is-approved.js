"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: is-approved.ts
 * Path: \src\conditions\pr\is-approved.ts
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
const type = 'isApproved';
/** Checks if a pull request has requested a review.

Example:

```json
{
    "type": "isApproved",
    "required": 1
}
```
@examples require(".").example
*/
function isApproved(condition, context) {
    const reviewers = [];
    for (const review of context.reviews) {
        if (!reviewers.includes(review.user.login)) {
            reviewers.push(review.user.login);
        }
    }
    return (!context.pendingReview
        && context.approved >= reviewers.length
        && context.approved >= condition.condition);
}
exports.default = [type, isApproved];
exports.example = {
    type,
    condition: 1,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXMtYXBwcm92ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29uZGl0aW9ucy9wci9pcy1hcHByb3ZlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHOzs7QUFLSCxNQUFNLElBQUksR0FBRyxZQUFZLENBQUM7QUFPMUI7Ozs7Ozs7Ozs7O0VBV0U7QUFFRixTQUFTLFVBQVUsQ0FFbEIsU0FBOEIsRUFDOUIsT0FBZ0I7SUFFaEIsTUFBTSxTQUFTLEdBQWEsRUFBRSxDQUFDO0lBQy9CLEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRTtRQUNyQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQzNDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNsQztLQUNEO0lBRUQsT0FBTyxDQUNOLENBQUMsT0FBTyxDQUFDLGFBQWE7V0FDbkIsT0FBTyxDQUFDLFFBQVEsSUFBSSxTQUFTLENBQUMsTUFBTTtXQUNwQyxPQUFPLENBQUMsUUFBUSxJQUFJLFNBQVMsQ0FBQyxTQUFTLENBQzFDLENBQUM7QUFDSCxDQUFDO0FBRUQsa0JBQWUsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFVLENBQUM7QUFDOUIsUUFBQSxPQUFPLEdBQXdCO0lBQzNDLElBQUk7SUFDSixTQUFTLEVBQUUsQ0FBQztDQUNaLENBQUMifQ==