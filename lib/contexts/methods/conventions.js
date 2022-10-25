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
import * as core from '@actions/core';
import { log, LoggingLevels } from '../../logging.js';
import { evaluator } from '../../evaluator.js';
import { semantic } from '../../utils/helper/semantic.js';
export async function enforce() {
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
            for (const condition of semantic) {
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
                    + semantic.join(', ')
                    + (convention.contexts
                        ? `\r\n\r\n Contexts: ${convention.contexts.join(', ')}`
                        : '');
            convention.condition = conditions;
        }
        const success = await evaluator.bind(this)(convention, this.context.props);
        if (success) {
            successful++;
        }
        else {
            failedMessages.push(convention.failedComment);
            log(LoggingLevels.info, convention.failedComment);
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
    log(LoggingLevels.info, 'All conventions successfully enforced. Moving to next step');
    await this.createComment.bind(this)('Conventions', true, {
        body: 'All conventions successfully enforced.',
    });
    return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udmVudGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udGV4dHMvbWV0aG9kcy9jb252ZW50aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQ0c7QUFFSCxxQ0FBcUM7QUFDckMsT0FBTyxLQUFLLElBQUksTUFBTSxlQUFlLENBQUM7QUFDdEMsT0FBTyxFQUFDLEdBQUcsRUFBRSxhQUFhLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUVwRCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDN0MsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBMEN4RCxNQUFNLENBQUMsS0FBSyxVQUFVLE9BQU87SUFDNUIsSUFDQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCO1dBQzVCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLEVBQzNDO1FBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0tBQzlDO0lBRUQsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO0lBQ2pCLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztJQUNuQixNQUFNLGNBQWMsR0FBYSxFQUFFLENBQUM7SUFDcEMsNkVBQTZFO0lBQzdFLEtBQUssTUFBTSxVQUFVLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLEVBQUU7UUFDbEUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUU7WUFDMUIsT0FBTztTQUNQO1FBRUQsUUFBUSxFQUFFLENBQUM7UUFDWCxJQUFJLFVBQVUsQ0FBQyxTQUFTLEtBQUssZUFBZSxFQUFFO1lBQzdDLFVBQVUsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLE1BQU0sVUFBVSxHQUFnQixFQUFFLENBQUM7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