"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: index.ts
 * Path: \src\conditions\util\index.ts
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
const and_js_1 = tslib_1.__importDefault(require("./and.js"));
const creator_matches_js_1 = tslib_1.__importDefault(require("./creator-matches.js"));
const description_matches_js_1 = tslib_1.__importDefault(require("./description-matches.js"));
const has_label_js_1 = tslib_1.__importDefault(require("./has-label.js"));
const is_abandoned_js_1 = tslib_1.__importDefault(require("./is-abandoned.js"));
const is_open_js_1 = tslib_1.__importDefault(require("./is-open.js"));
const is_stale_js_1 = tslib_1.__importDefault(require("./is-stale.js"));
const not_js_1 = tslib_1.__importDefault(require("./not.js"));
const only_js_1 = tslib_1.__importDefault(require("./only.js"));
const or_js_1 = tslib_1.__importDefault(require("./or.js"));
const title_matches_js_1 = tslib_1.__importDefault(require("./title-matches.js"));
/**
 * The utility condition handler.
 */
exports.handlers = [
    creator_matches_js_1.default,
    description_matches_js_1.default,
    is_open_js_1.default,
    is_stale_js_1.default,
    is_abandoned_js_1.default,
    has_label_js_1.default,
    title_matches_js_1.default,
    and_js_1.default,
    or_js_1.default,
    not_js_1.default,
    only_js_1.default,
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29uZGl0aW9ucy91dGlsL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQ0c7Ozs7QUFHSCw4REFBMkI7QUFFM0Isc0ZBQWtEO0FBRWxELDhGQUEwRDtBQUUxRCwwRUFBc0M7QUFFdEMsZ0ZBQTRDO0FBRTVDLHNFQUFrQztBQUVsQyx3RUFBb0M7QUFFcEMsOERBQTJCO0FBRTNCLGdFQUE2QjtBQUU3Qiw0REFBeUI7QUFFekIsa0ZBQThDO0FBZTlDOztHQUVHO0FBQ1UsUUFBQSxRQUFRLEdBQUc7SUFDdkIsNEJBQWM7SUFDZCxnQ0FBa0I7SUFDbEIsb0JBQU07SUFDTixxQkFBTztJQUNQLHlCQUFXO0lBQ1gsc0JBQVE7SUFDUiwwQkFBWTtJQUNaLGdCQUFHO0lBQ0gsZUFBRTtJQUNGLGdCQUFHO0lBQ0gsaUJBQUk7Q0FDSixDQUFDIn0=