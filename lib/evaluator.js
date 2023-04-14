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
const tslib_1 = require("tslib");
const logging_js_1 = require("./logging.js");
const index_js_1 = require("./conditions/index.js");
const forConditions = (conditions, callback) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let matches = 0;
    for (const condition of conditions) {
        const callbackResponse = callback(condition);
        if (callbackResponse) {
            matches++;
        }
    }
    return matches;
});
function evaluator(config, props) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { condition, requires } = config;
        (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, JSON.stringify(config));
        if (typeof condition === 'string') {
            throw new TypeError((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'String can not be used to evaluate conditions'));
        }
        // @ts-expect-error - still not sure how to resolve this
        const matches = yield forConditions(condition, (condition) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const handler = index_js_1.getConditionHandler.call(this, condition);
            if (!handler) {
                throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Handler must be defined'));
            }
            (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, `The handler is ${handler.name}`);
            // @ts-expect-error - Todo: need to be fixed, typing issue which never gets triggered in runtime
            return handler === null || handler === void 0 ? void 0 : handler.call(this, condition, props);
        }));
        (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, `Matches: ${matches}/${requires}`);
        return matches >= requires;
    });
}
exports.evaluator = evaluator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZhbHVhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2V2YWx1YXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHOzs7O0FBRUgsNkNBQWdEO0FBUWhELG9EQUUrQjtBQVEvQixNQUFNLGFBQWEsR0FBRyxDQUNyQixVQUFzRixFQUN0RixRQUFxRyxFQUNwRyxFQUFFO0lBQ0gsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO0lBQ2hCLEtBQUssTUFBTSxTQUFTLElBQUksVUFBVSxFQUFFO1FBQ25DLE1BQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzdDLElBQUksZ0JBQWdCLEVBQUU7WUFDckIsT0FBTyxFQUFFLENBQUM7U0FDVjtLQUNEO0lBRUQsT0FBTyxPQUFPLENBQUM7QUFDaEIsQ0FBQyxDQUFBLENBQUM7QUFFRixTQUFzQixTQUFTLENBRTlCLE1BSXlCLEVBQ3pCLEtBQWdCOztRQUVoQixNQUFNLEVBQUMsU0FBUyxFQUFFLFFBQVEsRUFBQyxHQUFHLE1BQU0sQ0FBQztRQUNyQyxJQUFBLGdCQUFHLEVBQUMsMEJBQWEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2pELElBQUksT0FBTyxTQUFTLEtBQUssUUFBUSxFQUFFO1lBQ2xDLE1BQU0sSUFBSSxTQUFTLENBQUMsSUFBQSxnQkFBRyxFQUN0QiwwQkFBYSxDQUFDLEtBQUssRUFDbkIsK0NBQStDLENBQy9DLENBQUMsQ0FBQztTQUNIO1FBRUQsd0RBQXdEO1FBQ3hELE1BQU0sT0FBTyxHQUFHLE1BQU0sYUFBYSxDQUFDLFNBQVMsRUFBRSxDQUFNLFNBQVMsRUFBQyxFQUFFO1lBQ2hFLE1BQU0sT0FBTyxHQUFHLDhCQUFtQixDQUFDLElBQUksQ0FDdkMsSUFBSSxFQUNKLFNBQVMsQ0FDVCxDQUFDO1lBRUYsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDYixNQUFNLElBQUksS0FBSyxDQUFDLElBQUEsZ0JBQUcsRUFDbEIsMEJBQWEsQ0FBQyxLQUFLLEVBQ25CLHlCQUF5QixDQUN6QixDQUFDLENBQUM7YUFDSDtZQUVELElBQUEsZ0JBQUcsRUFBQywwQkFBYSxDQUFDLEtBQUssRUFBRSxrQkFBa0IsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFFM0QsZ0dBQWdHO1lBQ2hHLE9BQU8sT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzlDLENBQUMsQ0FBQSxDQUFDLENBQUM7UUFDSCxJQUFBLGdCQUFHLEVBQUMsMEJBQWEsQ0FBQyxLQUFLLEVBQUUsWUFBWSxPQUFPLElBQUksUUFBUSxFQUFFLENBQUMsQ0FBQztRQUM1RCxPQUFPLE9BQU8sSUFBSSxRQUFRLENBQUM7SUFDNUIsQ0FBQztDQUFBO0FBdkNELDhCQXVDQyJ9