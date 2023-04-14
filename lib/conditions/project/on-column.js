"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: on-column.ts
 * Path: \src\conditions\project\on-column.ts
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
const type = 'onColumn';
/** Checks if the card is in the specified column.
@examples require(".").example
Example:

```json
{
    "type": "onColumn",
    "project": "Isuues",
    "column": "New"
}
``` */
function onColumn(condition, context) {
    var _a;
    if (!context.localCard) {
        return false;
    }
    return (((_a = context.localColumn) === null || _a === void 0 ? void 0 : _a.name) === condition.column
        && context.project.name === condition.project);
}
exports.default = [type, onColumn];
exports.example = { type, project: 'Issues', column: 'New' };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib24tY29sdW1uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbmRpdGlvbnMvcHJvamVjdC9vbi1jb2x1bW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNDRzs7O0FBS0gsTUFBTSxJQUFJLEdBQUcsVUFBVSxDQUFDO0FBT3hCOzs7Ozs7Ozs7O01BVU07QUFDTixTQUFTLFFBQVEsQ0FFaEIsU0FBNEIsRUFDNUIsT0FBcUI7O0lBRXJCLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFO1FBQ3ZCLE9BQU8sS0FBSyxDQUFDO0tBQ2I7SUFFRCxPQUFPLENBQ04sQ0FBQSxNQUFBLE9BQU8sQ0FBQyxXQUFXLDBDQUFFLElBQUksTUFBSyxTQUFTLENBQUMsTUFBTTtXQUMzQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxTQUFTLENBQUMsT0FBTyxDQUM3QyxDQUFDO0FBQ0gsQ0FBQztBQUVELGtCQUFlLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBVSxDQUFDO0FBQzVCLFFBQUEsT0FBTyxHQUFzQixFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUMsQ0FBQyJ9