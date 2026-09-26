"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: or.ts
 * Path: \src\conditions\util\or.ts
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
const evaluator_js_1 = require("../../evaluator.js");
const type = '$or';
/** Allows conditions to be combined to create more advanced conditions. Would require one conditions to return true otherwise it would fail. If both return true, this would return false.
@examples require(".").example
```json
{
    "type": "$or",
    "condition": [
        {
            "requires": 1,
            "conditions": []
        },
        {
            "requires": 1,
            "conditions": []
        }
    ]
}
``` */
async function or(condition, context) {
    const results = await run.call(this, condition, context);
    const success = results.filter(Boolean).length;
    return success > 0;
}
exports.default = [type, or];
async function run(condition, context) {
    const results = [];
    for (const conditions of condition.condition) {
        results.push(evaluator_js_1.evaluator.call(this, conditions, context));
    }
    return Promise.all(results);
}
exports.example = {
    type,
    condition: [
        {
            requires: 1,
            condition: [
                {
                    type: 'isDraft',
                    condition: true,
                },
            ],
        },
        {
            requires: 1,
            condition: [
                {
                    type: 'isOpen',
                    condition: true,
                },
            ],
        },
    ],
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29uZGl0aW9ucy91dGlsL29yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQ0c7OztBQVNILHFEQUE2QztBQUU3QyxNQUFNLElBQUksR0FBRyxLQUFLLENBQUM7QUFPbkI7Ozs7Ozs7Ozs7Ozs7Ozs7TUFnQk07QUFFTixLQUFLLFVBQVUsRUFBRSxDQUFpQixTQUFzQixFQUFFLE9BQWtCO0lBQzNFLE1BQU0sT0FBTyxHQUFHLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3pELE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQy9DLE9BQU8sT0FBTyxHQUFHLENBQUMsQ0FBQztBQUNwQixDQUFDO0FBRUQsa0JBQWUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFVLENBQUM7QUFFbkMsS0FBSyxVQUFVLEdBQUcsQ0FBaUIsU0FBc0IsRUFBRSxPQUFrQjtJQUM1RSxNQUFNLE9BQU8sR0FBNEIsRUFBRSxDQUFDO0lBRTVDLEtBQUssTUFBTSxVQUFVLElBQUksU0FBUyxDQUFDLFNBQVMsRUFBRTtRQUM3QyxPQUFPLENBQUMsSUFBSSxDQUFDLHdCQUFTLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztLQUN4RDtJQUVELE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM3QixDQUFDO0FBRVksUUFBQSxPQUFPLEdBQWdCO0lBQ25DLElBQUk7SUFDSixTQUFTLEVBQUU7UUFDVjtZQUNDLFFBQVEsRUFBRSxDQUFDO1lBQ1gsU0FBUyxFQUFFO2dCQUNWO29CQUNDLElBQUksRUFBRSxTQUFTO29CQUNmLFNBQVMsRUFBRSxJQUFJO2lCQUNmO2FBQ0Q7U0FDRDtRQUNEO1lBQ0MsUUFBUSxFQUFFLENBQUM7WUFDWCxTQUFTLEVBQUU7Z0JBQ1Y7b0JBQ0MsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsU0FBUyxFQUFFLElBQUk7aUJBQ2Y7YUFDRDtTQUNEO0tBQ0Q7Q0FDRCxDQUFDIn0=