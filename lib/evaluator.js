"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: evaluator.ts
 * Path: \src\evaluator.ts
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
exports.evaluator = void 0;
const logging_js_1 = require("./logging.js");
const index_js_1 = require("./conditions/index.js");
const forConditions = async (conditions, callback) => {
    let matches = 0;
    for (const condition of conditions) {
        const callbackResponse = callback(condition);
        if (callbackResponse) {
            matches++;
        }
    }
    return matches;
};
async function evaluator(config, props) {
    const { condition, requires } = config;
    (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, JSON.stringify(config));
    if (typeof condition === 'string') {
        throw new TypeError((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'String can not be used to evaluate conditions'));
    }
    // @ts-expect-error - still not sure how to resolve this
    const matches = await forConditions(condition, async (condition) => {
        const handler = index_js_1.getConditionHandler.call(this, condition);
        if (!handler) {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Handler must be defined'));
        }
        (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, `The handler is ${handler.name}`);
        // @ts-expect-error - Todo: need to be fixed, typing issue which never gets triggered in runtime
        return handler?.call(this, condition, props);
    });
    (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, `Matches: ${matches}/${requires}`);
    return matches >= requires;
}
exports.evaluator = evaluator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZhbHVhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2V2YWx1YXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHOzs7QUFFSCw2Q0FBZ0Q7QUFRaEQsb0RBRStCO0FBUS9CLE1BQU0sYUFBYSxHQUFHLEtBQUssRUFDMUIsVUFBc0YsRUFDdEYsUUFBcUcsRUFDcEcsRUFBRTtJQUNILElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztJQUNoQixLQUFLLE1BQU0sU0FBUyxJQUFJLFVBQVUsRUFBRTtRQUNuQyxNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM3QyxJQUFJLGdCQUFnQixFQUFFO1lBQ3JCLE9BQU8sRUFBRSxDQUFDO1NBQ1Y7S0FDRDtJQUVELE9BQU8sT0FBTyxDQUFDO0FBQ2hCLENBQUMsQ0FBQztBQUVLLEtBQUssVUFBVSxTQUFTLENBRTlCLE1BSXlCLEVBQ3pCLEtBQWdCO0lBRWhCLE1BQU0sRUFBQyxTQUFTLEVBQUUsUUFBUSxFQUFDLEdBQUcsTUFBTSxDQUFDO0lBQ3JDLElBQUEsZ0JBQUcsRUFBQywwQkFBYSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDakQsSUFBSSxPQUFPLFNBQVMsS0FBSyxRQUFRLEVBQUU7UUFDbEMsTUFBTSxJQUFJLFNBQVMsQ0FBQyxJQUFBLGdCQUFHLEVBQ3RCLDBCQUFhLENBQUMsS0FBSyxFQUNuQiwrQ0FBK0MsQ0FDL0MsQ0FBQyxDQUFDO0tBQ0g7SUFFRCx3REFBd0Q7SUFDeEQsTUFBTSxPQUFPLEdBQUcsTUFBTSxhQUFhLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBQyxTQUFTLEVBQUMsRUFBRTtRQUNoRSxNQUFNLE9BQU8sR0FBRyw4QkFBbUIsQ0FBQyxJQUFJLENBQ3ZDLElBQUksRUFDSixTQUFTLENBQ1QsQ0FBQztRQUVGLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDYixNQUFNLElBQUksS0FBSyxDQUFDLElBQUEsZ0JBQUcsRUFDbEIsMEJBQWEsQ0FBQyxLQUFLLEVBQ25CLHlCQUF5QixDQUN6QixDQUFDLENBQUM7U0FDSDtRQUVELElBQUEsZ0JBQUcsRUFBQywwQkFBYSxDQUFDLEtBQUssRUFBRSxrQkFBa0IsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFFM0QsZ0dBQWdHO1FBQ2hHLE9BQU8sT0FBTyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzlDLENBQUMsQ0FBQyxDQUFDO0lBQ0gsSUFBQSxnQkFBRyxFQUFDLDBCQUFhLENBQUMsS0FBSyxFQUFFLFlBQVksT0FBTyxJQUFJLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDNUQsT0FBTyxPQUFPLElBQUksUUFBUSxDQUFDO0FBQzVCLENBQUM7QUF2Q0QsOEJBdUNDIn0=