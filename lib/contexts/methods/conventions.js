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
async function enforce() {
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
        const success = await evaluator_js_1.evaluator.bind(this)(convention, this.context.props);
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
        const suffix = `\r\n\r\n----------\r\n\r\nThis message will be automatically updated when you make this change\r\n\r\n${this.config.enforceConventions.commentFooter ?? ''}`;
        const body = `${this.config.enforceConventions.commentHeader ?? ''}\r\n\r\n`
            + String(failedMessages?.join('\r\n\r\n'))
            + suffix;
        await this.createComment.bind(this)('Conventions', false, { body });
        return false;
    }
    (0, logging_js_1.log)(logging_js_1.LoggingLevels.info, 'All conventions successfully enforced. Moving to next step');
    await this.createComment.bind(this)('Conventions', true, {
        body: 'All conventions successfully enforced.',
    });
    return true;
}
exports.enforce = enforce;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udmVudGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udGV4dHMvbWV0aG9kcy9jb252ZW50aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHOzs7O0FBRUgscUNBQXFDO0FBQ3JDLDREQUFzQztBQUN0QyxpREFBb0Q7QUFFcEQscURBQTZDO0FBQzdDLGdFQUF3RDtBQTBDakQsS0FBSyxVQUFVLE9BQU87SUFDNUIsSUFDQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCO1dBQzVCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLEVBQzNDO1FBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0tBQzlDO0lBRUQsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO0lBQ2pCLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztJQUNuQixNQUFNLGNBQWMsR0FBYSxFQUFFLENBQUM7SUFDcEMsNkVBQTZFO0lBQzdFLEtBQUssTUFBTSxVQUFVLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLEVBQUU7UUFDbEUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUU7WUFDMUIsT0FBTztTQUNQO1FBRUQsUUFBUSxFQUFFLENBQUM7UUFDWCxJQUFJLFVBQVUsQ0FBQyxTQUFTLEtBQUssZUFBZSxFQUFFO1lBQzdDLFVBQVUsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLE1BQU0sVUFBVSxHQUFnQixFQUFFLENBQUM7WUFDbkMsS0FBSyxNQUFNLFNBQVMsSUFBSSxzQkFBUSxFQUFFO2dCQUNqQyxVQUFVLENBQUMsSUFBSSxDQUFDO29CQUNmLElBQUksRUFBRSxjQUFjO29CQUNwQixTQUFTLEVBQUUsS0FBSyxTQUFTLGdCQUFnQjtpQkFDekMsQ0FB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