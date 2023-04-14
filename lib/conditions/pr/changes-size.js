"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: changes-size.ts
 * Path: \src\conditions\pr\changes-size.ts
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
const type = 'changesSize';
/** Checks if an pull request's changes against `min` & `max` values. Note: if `max` is `undefined` assumed value is `unlimited`

Example:

```json
{
    "type": "changesSize",
    "min": 0,
    "max": 100
}
```
@examples require(".").example
*/
function changesSize(condition, context) {
    if (context.changes >= condition.min
        && ((condition.max && context.changes < condition.max) ?? !condition.max)) {
        return true;
    }
    return false;
}
exports.default = [type, changesSize];
exports.example = {
    type,
    min: 0,
    max: 100,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlcy1zaXplLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbmRpdGlvbnMvcHIvY2hhbmdlcy1zaXplLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQ0c7OztBQUtILE1BQU0sSUFBSSxHQUFHLGFBQWEsQ0FBQztBQVEzQjs7Ozs7Ozs7Ozs7O0VBWUU7QUFDRixTQUFTLFdBQVcsQ0FFbkIsU0FBK0IsRUFDL0IsT0FBZ0I7SUFFaEIsSUFDQyxPQUFPLENBQUMsT0FBTyxJQUFJLFNBQVMsQ0FBQyxHQUFHO1dBQzdCLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUN4RTtRQUNELE9BQU8sSUFBSSxDQUFDO0tBQ1o7SUFFRCxPQUFPLEtBQUssQ0FBQztBQUNkLENBQUM7QUFFRCxrQkFBZSxDQUFDLElBQUksRUFBRSxXQUFXLENBQVUsQ0FBQztBQUUvQixRQUFBLE9BQU8sR0FBeUI7SUFDNUMsSUFBSTtJQUNKLEdBQUcsRUFBRSxDQUFDO0lBQ04sR0FBRyxFQUFFLEdBQUc7Q0FDUixDQUFDIn0=