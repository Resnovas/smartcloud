"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: and.ts
 * Path: \src\conditions\util\and.ts
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
const evaluator_js_1 = require("../../evaluator.js");
const type = '$and';
/**
Allows conditions to be combined to create more advanced conditions. Requires all conditions to return true otherwise it would fail.
@examples require(".").example
```json
{
    "type": "$and",
    "condition": [
        {
            "requires": 1,
            "condition": []
        },
        {
            "requires": 1,
            "condition": []
        }
    ]
}
``` */
function and(condition, context) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const results = yield run.call(this, condition, context);
        const success = results.filter(Boolean).length;
        return success === condition.condition.length;
    });
}
exports.default = [type, and];
function run(condition, context) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const results = [];
        for (const conditions of condition.condition) {
            results.push(evaluator_js_1.evaluator.call(this, conditions, context));
        }
        return Promise.all(results);
    });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbmRpdGlvbnMvdXRpbC9hbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNDRzs7OztBQVNILHFEQUE2QztBQUU3QyxNQUFNLElBQUksR0FBRyxNQUFNLENBQUM7QUFNcEI7Ozs7Ozs7Ozs7Ozs7Ozs7O01BaUJNO0FBRU4sU0FBZSxHQUFHLENBQWlCLFNBQXVCLEVBQUUsT0FBa0I7O1FBQzdFLE1BQU0sT0FBTyxHQUFHLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3pELE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQy9DLE9BQU8sT0FBTyxLQUFLLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO0lBQy9DLENBQUM7Q0FBQTtBQUVELGtCQUFlLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBVSxDQUFDO0FBRXBDLFNBQWUsR0FBRyxDQUFpQixTQUF1QixFQUFFLE9BQWtCOztRQUM3RSxNQUFNLE9BQU8sR0FBNEIsRUFBRSxDQUFDO1FBRTVDLEtBQUssTUFBTSxVQUFVLElBQUksU0FBUyxDQUFDLFNBQVMsRUFBRTtZQUM3QyxPQUFPLENBQUMsSUFBSSxDQUFDLHdCQUFTLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUN4RDtRQUVELE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM3QixDQUFDO0NBQUE7QUFFWSxRQUFBLE9BQU8sR0FBaUI7SUFDcEMsSUFBSTtJQUNKLFNBQVMsRUFBRTtRQUNWO1lBQ0MsUUFBUSxFQUFFLENBQUM7WUFDWCxTQUFTLEVBQUU7Z0JBQ1Y7b0JBQ0MsSUFBSSxFQUFFLFNBQVM7b0JBQ2YsU0FBUyxFQUFFLElBQUk7aUJBQ2Y7YUFDRDtTQUNEO1FBQ0Q7WUFDQyxRQUFRLEVBQUUsQ0FBQztZQUNYLFNBQVMsRUFBRTtnQkFDVjtvQkFDQyxJQUFJLEVBQUUsUUFBUTtvQkFDZCxTQUFTLEVBQUUsSUFBSTtpQkFDZjthQUNEO1NBQ0Q7S0FDRDtDQUNELENBQUMifQ==