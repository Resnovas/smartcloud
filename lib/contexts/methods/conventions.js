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
        console.log(gitmojis_1.gitmojis);
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
            + semantic_js_1.semantic.join(',\r\n')
            + (convention.contexts
                ? `\r\n\r\n Contexts: ${convention.contexts.join(',\r\n')}`
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
        = `Gitmoji Conditions failed - Please title your ${this.curContext.type === 'pr' ? 'pull request' : 'issue'} using one of the valid options:\r\n\r\n Types: `
            + failConventionComment.join(',\r\n')
            + (convention.contexts
                ? `\r\n\r\n Contexts: ${convention.contexts.join(',\r\n')}`
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
            + '\r\n\r\nGitmoji Options: '
            + failConventionComment.join(',\r\n')
            + '\r\n\r\nSemantic Options: '
            + semantic_js_1.semantic.join(',\r\n')
            + (convention.contexts
                ? `\r\n\r\n Contexts: ${convention.contexts.join(',\r\n')}`
                : '')
            + '\r\n\r\nFor more information on Semantic Commit Messages, please see https://www.conventionalcommits.org/en/v1.0.0/'
            + '\r\nFor more information on gitmoji, please visit https://gitmoji.dev/';
    return { conditions, requires };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udmVudGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udGV4dHMvbWV0aG9kcy9jb252ZW50aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHOzs7O0FBRUgscUNBQXFDO0FBQ3JDLDREQUFzQztBQUN0Qyx1Q0FBa0M7QUFDbEMsaURBQW9EO0FBRXBELHFEQUE2QztBQUM3QyxnRUFBd0Q7QUEwQ2pELEtBQUssVUFBVSxPQUFPO0lBQzVCLElBQ0MsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGtCQUFrQjtXQUM1QixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsU0FBUyxFQUMzQztRQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsNEJBQTRCLENBQUMsQ0FBQztLQUM5QztJQUVELElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQztJQUNqQixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDbkIsTUFBTSxjQUFjLEdBQWEsRUFBRSxDQUFDO0lBQ3BDLDZFQUE2RTtJQUM3RSxLQUFLLE1BQU0sVUFBVSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsU0FBUyxFQUFFO1FBQ2xFLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFO1lBQzFCLE9BQU87U0FDUDtRQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQVEsQ0FBQyxDQUFDO1FBQ3RCLFFBQVEsRUFBRSxDQUFDO1FBQ1gsSUFBSSxVQUFVLENBQUMsU0FBUyxLQUFLLGVBQWUsRUFBRTtZQUM3QyxNQUFNLEVBQUMsVUFBVSxFQUFFLFFBQVEsRUFBQyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDcEUsVUFBVSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUM7WUFDbEMsVUFBVSxDQUFD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