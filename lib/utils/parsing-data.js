"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: parsing-data.ts
 * Path: \src\utils\parsing-data.ts
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
exports.parseLabels = exports.normalize = exports.processRegExpcondition = exports.formatColor = void 0;
const tslib_1 = require("tslib");
/**
 * Formats the hex color code to ensure no hash (#) is included
 * @author IvanFon, TGTGamer
 * @param {String} color Hex color code
 * @since 1.0.0
 */
const formatColor = (color) => {
    if (color.startsWith('#')) {
        return color.slice(1);
    }
    return color;
};
exports.formatColor = formatColor;
/**
 * Formats the hex color code to ensure no hash (#) is included
 * @author IvanFon, jbinda
 * @param {String} condition Regex partern to use
 * @since 1.0.0
 */
const processRegExpcondition = (condition) => {
    const matchDelimiters = /^\/(.*)\/(.*)$/.exec(condition);
    const [, source, flags] = matchDelimiters !== null && matchDelimiters !== void 0 ? matchDelimiters : [];
    return new RegExp(source !== null && source !== void 0 ? source : condition, flags);
};
exports.processRegExpcondition = processRegExpcondition;
/**
 * Normalizes text toUpperCase
 * @author IvanFon, TGTGamer
 * @since 1.0.0
 */
const normalize = (text) => (text || '').toUpperCase();
exports.normalize = normalize;
/**
 * Parse the labels
 * @author IvanFon, TGTGamer, jbinda
 * @since 1.0.0
 */
// todo : fix this
const parseLabels = (labels) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!Array.isArray(labels)) {
        return;
    }
    // eslint-disable-next-line unicorn/no-array-reduce
    return labels.reduce((acc, cur) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        acc[cur.name.toLowerCase()] = cur;
        return acc;
    }, {});
});
exports.parseLabels = parseLabels;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2luZy1kYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL3BhcnNpbmctZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHOzs7O0FBSUg7Ozs7O0dBS0c7QUFDSSxNQUFNLFdBQVcsR0FBRyxDQUFDLEtBQWEsRUFBRSxFQUFFO0lBQzVDLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUMxQixPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDdEI7SUFFRCxPQUFPLEtBQUssQ0FBQztBQUNkLENBQUMsQ0FBQztBQU5XLFFBQUEsV0FBVyxlQU10QjtBQUVGOzs7OztHQUtHO0FBQ0ksTUFBTSxzQkFBc0IsR0FBRyxDQUFDLFNBQWlCLEVBQUUsRUFBRTtJQUMzRCxNQUFNLGVBQWUsR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFekQsTUFBTSxDQUFDLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxHQUFHLGVBQWUsYUFBZixlQUFlLGNBQWYsZUFBZSxHQUFJLEVBQUUsQ0FBQztJQUVoRCxPQUFPLElBQUksTUFBTSxDQUFDLE1BQU0sYUFBTixNQUFNLGNBQU4sTUFBTSxHQUFJLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUMvQyxDQUFDLENBQUM7QUFOVyxRQUFBLHNCQUFzQiwwQkFNakM7QUFFRjs7OztHQUlHO0FBQ0ksTUFBTSxTQUFTLEdBQUcsQ0FBQyxJQUFZLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQXpELFFBQUEsU0FBUyxhQUFnRDtBQUV0RTs7OztHQUlHO0FBRUgsa0JBQWtCO0FBQ1gsTUFBTSxXQUFXLEdBQUcsQ0FBTyxNQUFXLEVBQStCLEVBQUU7SUFDN0UsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDM0IsT0FBTztLQUNQO0lBRUQsbURBQW1EO0lBQ25ELE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQTBCLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFDeEQsNkRBQTZEO1FBQzdELEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsR0FBWSxDQUFDO1FBQzNDLE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ1IsQ0FBQyxDQUFBLENBQUM7QUFYVyxRQUFBLFdBQVcsZUFXdEIifQ==