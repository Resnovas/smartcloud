"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: index.ts
 * Path: \src\conditions\pr\index.ts
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
exports.handlers = void 0;
const tslib_1 = require("tslib");
const branch_matches_js_1 = tslib_1.__importDefault(require("./branch-matches.js"));
const changes_size_js_1 = tslib_1.__importDefault(require("./changes-size.js"));
const files_match_js_1 = tslib_1.__importDefault(require("./files-match.js"));
const is_approved_js_1 = tslib_1.__importDefault(require("./is-approved.js"));
const is_draft_js_1 = tslib_1.__importDefault(require("./is-draft.js"));
const pending_review_js_1 = tslib_1.__importDefault(require("./pending-review.js"));
const requested_changes_js_1 = tslib_1.__importDefault(require("./requested-changes.js"));
exports.handlers = [
    branch_matches_js_1.default,
    files_match_js_1.default,
    is_draft_js_1.default,
    changes_size_js_1.default,
    pending_review_js_1.default,
    requested_changes_js_1.default,
    is_approved_js_1.default,
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29uZGl0aW9ucy9wci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHOzs7O0FBSUgsb0ZBQWdEO0FBRWhELGdGQUE0QztBQUU1Qyw4RUFBMEM7QUFFMUMsOEVBQTBDO0FBRTFDLHdFQUFvQztBQUVwQyxvRkFBZ0Q7QUFFaEQsMEZBQXNEO0FBWXpDLFFBQUEsUUFBUSxHQUFHO0lBQ3ZCLDJCQUFhO0lBQ2Isd0JBQVU7SUFDVixxQkFBTztJQUNQLHlCQUFXO0lBQ1gsMkJBQWE7SUFDYiw4QkFBZ0I7SUFDaEIsd0JBQVU7Q0FDVixDQUFDIn0=