"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: conventions.ts
 * Path: \src\contexts\methods\conventions.ts
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
exports.enforce = void 0;
const tslib_1 = require("tslib");
/* eslint-disable no-await-in-loop */
const core = tslib_1.__importStar(require("@actions/core"));
const logging_js_1 = require("../../logging.js");
const evaluator_js_1 = require("../../evaluator.js");
const semantic_js_1 = require("../../utils/helper/semantic.js");
function enforce() {
    var _a, _b;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!this.config.enforceConventions
            || !this.config.enforceConventions.condition) {
            throw new Error('No enforceable conventions');
        }
        let required = 0;
        let successful = 0;
        const failedMessages = [];
        // This.config.enforceConventions.conventions.forEach(async (convention) => {
        for (const convention of this.config.enforceConventions.condition) {
            if (!convention.condition) {
                return;
            }
            required++;
            if (convention.condition === 'semanticTitle') {
                convention.requires = 1;
                const conditions = [];
                for (const condition of semantic_js_1.semantic) {
                    conditions.push({
                        type: 'titleMatches',
                        condition: `/^${condition}(\\(.*\\))?:/i`,
                    });
                }
                if (convention.contexts) {
                    convention.requires = 2;
                    for (const condition of convention.contexts) {
                        conditions.push({
                            type: 'titleMatches',
                            condition: `/\\(.*${condition}.*\\):/i`,
                        });
                    }
                }
                convention.failedComment
                    = `Semantic Conditions failed - Please title your ${this.curContext.type === 'pr' ? 'pull request' : 'issue'} using one of the valid options:\r\n\r\n Types: `
                        + semantic_js_1.semantic.join(', ')
                        + (convention.contexts
                            ? `\r\n\r\n Contexts: ${convention.contexts.join(', ')}`
                            : '');
                convention.condition = conditions;
            }
            const success = yield evaluator_js_1.evaluator.bind(this)(convention, this.context.props);
            if (success) {
                successful++;
            }
            else {
                failedMessages.push(convention.failedComment);
                (0, logging_js_1.log)(logging_js_1.LoggingLevels.info, convention.failedComment);
            }
        }
        if (required > successful) {
            for (const fail of failedMessages) {
                core.setFailed(fail);
            }
            const suffix = `\r\n\r\n----------\r\n\r\nThis message will be automatically updated when you make this change\r\n\r\n${(_a = this.config.enforceConventions.commentFooter) !== null && _a !== void 0 ? _a : ''}`;
            const body = `${(_b = this.config.enforceConventions.commentHeader) !== null && _b !== void 0 ? _b : ''}\r\n\r\n`
                + String(failedMessages === null || failedMessages === void 0 ? void 0 : failedMessages.join('\r\n\r\n'))
                + suffix;
            yield this.createComment.bind(this)('Conventions', false, { body });
            return false;
        }
        (0, logging_js_1.log)(logging_js_1.LoggingLevels.info, 'All conventions successfully enforced. Moving to next step');
        yield this.createComment.bind(this)('Conventions', true, {
            body: 'All conventions successfully enforced.',
        });
        return true;
    });
}
exports.enforce = enforce;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udmVudGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udGV4dHMvbWV0aG9kcy9jb252ZW50aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHOzs7O0FBRUgscUNBQXFDO0FBQ3JDLDREQUFzQztBQUN0QyxpREFBb0Q7QUFFcEQscURBQTZDO0FBQzdDLGdFQUF3RDtBQTBDeEQsU0FBc0IsT0FBTzs7O1FBQzVCLElBQ0MsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGtCQUFrQjtlQUM1QixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsU0FBUyxFQUMzQztZQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsNEJBQTRCLENBQUMsQ0FBQztTQUM5QztRQUVELElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQztRQUNqQixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDbkIsTUFBTSxjQUFjLEdBQWEsRUFBRSxDQUFDO1FBQ3BDLDZFQUE2RTtRQUM3RSxLQUFLLE1BQU0sVUFBVSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsU0FBUyxFQUFFO1lBQ2xFLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFO2dCQUMxQixPQUFPO2FBQ1A7WUFFRCxRQUFRLEVBQUUsQ0FBQztZQUNYLElBQUksVUFBVSxDQUFDLFNBQVMsS0FBSyxlQUFlLEVBQUU7Z0JBQzdDLFVBQVUsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO2dCQUN4QixNQUFNLFVBQVUsR0FBZ0IsRUFBRSxDQUFDO2dCQUNuQyxLQUFLLE1BQU0sU0FBUyxJQUFJLHNCQUFRLEVBQUU7b0JBQ2pDLFVBQVUsQ0FBQyxJQUFJLENBQUM7d0JBQ2YsSUFBSSxFQUFFLGNBQWM7d0JBQ3BCLFNBQVMsRUFBRSxLQUFLLFNBQVMsZ0JBQWdCO3FCQUN6QyxD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