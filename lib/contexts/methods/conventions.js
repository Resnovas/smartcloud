"use strict";
/**
 * Project: @resnovas/smartcloud
 * File: conventions.ts
 * Path: \src\contexts\methods\conventions.ts
 * Created Date: Sunday, April 16th 2023
 * Author: Jonathan Stevens (jonathan@resnovas.com)
 * -----
 * Last Modified: Sun Apr 16 2023
 * Modified By: Jonathan Stevens
 * Current Version: 1.0.0-beta.7
 * -----
 * Copyright (c) 2023 Resnovas - All Rights Reserved
 * -----
 * LICENSE: GNU General Public License v3.0 or later (GPL-3.0+)
 *
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
 * along with this program. If not, please write to: jonathan@resnovas.com ,
 * or see https://www.gnu.org/licenses/gpl-3.0-standalone.html
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE - PLEASE SEE THE LICENSE FILE FOR DETAILS
 * -----
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.enforce = void 0;
const tslib_1 = require("tslib");
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
/* eslint-disable no-await-in-loop */
const core = tslib_1.__importStar(require("@actions/core"));
const gitmojis_1 = require("gitmojis");
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
            const { conditions, requires } = semanticTitle.bind(this)(convention);
            convention.condition = conditions;
            convention.requires = requires;
        }
        if (convention.condition === 'gitmojis') {
            const { conditions, requires } = gitmoji.bind(this)(convention);
            convention.condition = conditions;
            convention.requires = requires;
        }
        if (convention.condition === 'semanticEmoji') {
            const { conditions, requires } = semanticEmoji.bind(this)(convention);
            convention.condition = conditions;
            convention.requires = requires;
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
function semanticTitle(convention) {
    let requires = 1;
    const conditions = [];
    for (const condition of semantic_js_1.semantic) {
        conditions.push({
            type: 'titleMatches',
            condition: `/^${condition}(\\(.*\\))?:/i`,
        });
    }
    if (convention.contexts) {
        requires = 2;
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
                : '')
            + '\r\n\r\nFor more information on Semantic Commit Messages, please see https://www.conventionalcommits.org/en/v1.0.0/';
    return { conditions, requires };
}
function gitmoji(convention) {
    let requires = 1;
    const conditions = [];
    const failConventionComment = [];
    for (const condition of gitmojis_1.gitmojis) {
        conditions.push({
            type: 'titleMatches',
            condition: `/^${condition.emoji}(\\(.*\\))?:/i`,
        }, {
            type: 'titleMatches',
            condition: `/^${condition.code}(\\(.*\\))?:/i`,
        }, {
            type: 'titleMatches',
            condition: `/^${condition.entity}(\\(.*\\))?:/i`,
        });
        if (condition.semver) {
            failConventionComment.push(`${condition.emoji} || ${condition.code} === ${condition.description}`);
        }
    }
    if (convention.contexts) {
        requires = 2;
        for (const condition of convention.contexts) {
            conditions.push({
                type: 'titleMatches',
                condition: `/\\(.*${condition}.*\\):/i`,
            });
        }
    }
    convention.failedComment
        = `Gitmoji Conditions failed - Please title your ${this.curContext.type === 'pr' ? 'pull request' : 'issue'} using one of the valid options:\r\n\r\n Types: \r\n`
            + failConventionComment.join(',\r\n')
            + (convention.contexts
                ? `\r\n\r\n Contexts: ${convention.contexts.join(', ')}`
                : '')
            + '\r\n\r\nFor more information on gitmoji, please visit https://gitmoji.dev/';
    return { conditions, requires };
}
function semanticEmoji(convention) {
    let requires = 2;
    const conditions = [];
    const failConventionComment = [];
    for (const condition of gitmojis_1.gitmojis) {
        conditions.push({
            type: 'titleMatches',
            condition: `/^${condition.emoji}.*(\\(.*\\))?:/i`,
        }, {
            type: 'titleMatches',
            condition: `/^${condition.code}.*(\\(.*\\))?:/i`,
        }, {
            type: 'titleMatches',
            condition: `/^${condition.entity}.*(\\(.*\\))?:/i`,
        });
        if (condition.semver) {
            failConventionComment.push(`${condition.emoji} || ${condition.code} === ${condition.description}`);
        }
    }
    for (const condition of semantic_js_1.semantic) {
        conditions.push({
            type: 'titleMatches',
            condition: `/^.*${condition}(\\(.*\\))?:/i`,
        });
    }
    if (convention.contexts) {
        requires = 3;
        for (const condition of convention.contexts) {
            conditions.push({
                type: 'titleMatches',
                condition: `/\\(.*${condition}.*\\):/i`,
            });
        }
    }
    convention.failedComment
        = `SemanticEmoji Conditions failed - Please title your ${this.curContext.type === 'pr' ? 'pull request' : 'issue'} using a combination of the valid options:`
            + '\r\nExample: ":bug: fix(context): Fixing a bug in context"'
            + '\r\n\r\nGitmoji Options: \r\n'
            + failConventionComment.join(',\r\n')
            + '\r\n\r\nSemantic Options: \r\n'
            + semantic_js_1.semantic.join(', ')
            + (convention.contexts
                ? `\r\n\r\n Contexts: ${convention.contexts.join(', ')}`
                : '')
            + '\r\n\r\nFor more information on Semantic Commit Messages, please see https://www.conventionalcommits.org/en/v1.0.0/'
            + '\r\nFor more information on gitmoji, please visit https://gitmoji.dev/';
    return { conditions, requires };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udmVudGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udGV4dHMvbWV0aG9kcy9jb252ZW50aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQ0c7Ozs7QUFFSDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQ0c7QUFFSCxxQ0FBcUM7QUFDckMsNERBQXNDO0FBQ3RDLHVDQUFrQztBQUNsQyxpREFBb0Q7QUFFcEQscURBQTZDO0FBQzdDLGdFQUF3RDtBQTBDakQsS0FBSyxVQUFVLE9BQU87SUFDNUIsSUFDQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCO1dBQzVCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLEVBQzNDO1FBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0tBQzlDO0lBRUQsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO0lBQ2pCLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztJQUNuQixNQUFNLGNBQWMsR0FBYSxFQUFFLENBQUM7SUFDcEMsNkVBQTZFO0lBQzdFLEtBQUssTUFBTSxVQUFVLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLEVBQUU7UUFDbEUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUU7WUFDMUIsT0FBTztTQUNQO1FBRUQsUUFBUSxFQUFFLENBQUM7UUFDWCxJQUFJLFVBQVUsQ0FBQyxTQUFTLEtBQUssZUFBZSxFQUFFO1lBQzdDLE1BQU0sRUFBQyxVQUFVLEVBQUUsUUFBUSxFQUFDLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNwRSxVQUFVLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQztZQUNsQyxVQUFVLENB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