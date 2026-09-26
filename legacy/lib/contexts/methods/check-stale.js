"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: check-stale.ts
 * Path: \src\contexts\methods\check-stale.ts
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
 * Last Modified: 24-10-2022
 * By: Jonathan Stevens (Email: jonathan@resnovas.com, Github: https://github.com/TGTGamer)
 * Current Version: 1.0.0-beta.0
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkStale = void 0;
const logging_js_1 = require("../../logging.js");
const evaluator_js_1 = require("../../evaluator.js");
async function checkStale(context = this.context, configlocal = this.config) {
    const config = configlocal.stale;
    if (!config) {
        throw new Error('Stale is not enabled');
    }
    if (!context.props) {
        throw new Error('Context Props must exist');
    }
    const staleLabel = this.runnerConfigs.labels?.[config.staleLabel];
    if (!staleLabel) {
        throw new Error('Stale Label must exist');
    }
    const suffix = '\r\n\r\n----------\r\n\r\nSimply comment, assign or modify this issue to remove the stale status \r\n\r\n';
    if (config.stale && 'number' in context.props) {
        (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, 
        // @ts-expect-error known issue
        `Checking stale status for ${context.props.type} ${context.props.number} - ${String(context.props.title)}`);
        if (!config.stale.condition?.find(condition => condition.type === 'isStale')) {
            if (config.stale.condition) {
                config.stale.condition.push({
                    type: 'isStale',
                    condition: config.stale.days,
                });
            }
            else {
                config.stale.condition = [
                    { type: 'isStale', condition: config.stale.days },
                ];
            }
            if (config.stale.requires) {
                config.stale.requires++;
            }
            else {
                config.stale.requires = 1;
            }
        }
        // Check to see if the issue is stale using the evaluation function
        const stale = await evaluator_js_1.evaluator.call(this, config.stale, context.props);
        (0, logging_js_1.log)(logging_js_1.LoggingLevels.notice, 
        // @ts-expect-error known issue
        `Stale status for ${String(context.props.title)}: ${String(stale)}`);
        // If stale run the rest of the actions
        if ((stale)
            && this.config.labels
            && !this.config.labels[staleLabel]) {
            // Apply the stale label
            this.config.labels[staleLabel] = {
                condition: config.stale.condition,
                requires: 1,
            };
        }
        // Create the stale comment
        const isstale = stale;
        if (!this.dryRun) {
            await this.createComment.bind(this)('stale', isstale, {
                body: (isstale ? String(config.stale.comment) : String(config.stale.resolve))
                    + '\r\n\r\n'
                    + suffix.toString()
                    + String(config.stale.commentFooter ?? ''),
            });
        }
    }
    if (config.abandoned && 'number' in context.props) {
        (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, 
        // @ts-expect-error known issue
        `Checking abandoned status for ${context.props.type} ${String(context.props.number)} - ${String(context.props.title)}`);
        if (!config.abandoned.condition?.find(condition => condition.type === 'isAbandoned')) {
            if (config.abandoned.condition) {
                config.abandoned.condition.push({
                    type: 'isAbandoned',
                    condition: config.abandoned.days,
                    label: config.abandoned.label,
                });
            }
            else {
                config.abandoned.condition = [
                    {
                        type: 'isAbandoned',
                        condition: config.abandoned.days,
                        label: config.abandoned.label,
                    },
                ];
            }
            if (config.abandoned.requires) {
                config.abandoned.requires++;
            }
            else {
                config.abandoned.requires = 1;
            }
        }
        // Check to see if the issue is abandoned using the evaluation function
        const abandoned = await evaluator_js_1.evaluator.call(this, config.abandoned, context.props);
        (0, logging_js_1.log)(logging_js_1.LoggingLevels.notice, 
        // @ts-expect-error known issue
        `Abandoned status for ${String(context.props.title)}: ${String(abandoned)}`);
        const abandonedLabel = this.runnerConfigs.labels?.[config.abandoned.label];
        if (!abandonedLabel) {
            throw new Error('Stale Label must exist');
        }
        if ((abandoned)
            && abandonedLabel
            && this.config.labels
            && !this.config.labels[abandonedLabel]) {
            // Apply the stale label
            this.config.labels[abandonedLabel] = {
                condition: config.abandoned.condition,
                requires: 1,
            };
        }
        // Create the abandoned comment
        const isAbandoned = abandoned;
        if (!this.dryRun) {
            await this.createComment.bind(this)('stale', isAbandoned, {
                body: String((isAbandoned ? config.abandoned.comment : config.abandoned.resolve))
                    + '\r\n\r\n'
                    + String(suffix)
                    + String(config.abandoned.commentFooter ?? ''),
            });
        }
    }
}
exports.checkStale = checkStale;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2stc3RhbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udGV4dHMvbWV0aG9kcy9jaGVjay1zdGFsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHOzs7QUFJSCxpREFBb0Q7QUFFcEQscURBQTZDO0FBcUV0QyxLQUFLLFVBQVUsVUFBVSxDQUUvQixVQUE4RixJQUFJLENBQUMsT0FBTyxFQUMxRyxjQUE4RSxJQUFJLENBQUMsTUFBTTtJQUV6RixNQUFNLE1BQU0sR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDO0lBQ2pDLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDWixNQUFNLElBQUksS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUM7S0FDeEM7SUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRTtRQUNuQixNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUM7S0FDNUM7SUFFRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNsRSxJQUFJLENBQUMsVUFBVSxFQUFFO1FBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztLQUMxQztJQUVELE1BQU0sTUFBTSxHQUNULDJHQUEyRyxDQUFDO0lBRS9HLElBQUksTUFBTSxDQUFDLEtBQUssSUFBSSxRQUFRLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRTtRQUM5QyxJQUFBLGdCQUFHLEVBQ0YsMEJBQWEsQ0FBQyxLQUFLO1FBQ25CLCtCQUErQjtRQUMvQiw2QkFBNkIsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLE1BQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVB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