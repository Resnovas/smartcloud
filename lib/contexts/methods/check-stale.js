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
import { log, LoggingLevels } from '../../logging.js';
import { evaluator } from '../../evaluator.js';
export async function checkStale(context = this.context, configlocal = this.config) {
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
        log(LoggingLevels.debug, 
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
        const stale = await evaluator.call(this, config.stale, context.props);
        log(LoggingLevels.notice, 
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
        log(LoggingLevels.debug, 
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
        const abandoned = await evaluator.call(this, config.abandoned, context.props);
        log(LoggingLevels.notice, 
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2stc3RhbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udGV4dHMvbWV0aG9kcy9jaGVjay1zdGFsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQ0c7QUFJSCxPQUFPLEVBQUMsR0FBRyxFQUFFLGFBQWEsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRXBELE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQXFFN0MsTUFBTSxDQUFDLEtBQUssVUFBVSxVQUFVLENBRS9CLFVBQThGLElBQUksQ0FBQyxPQUFPLEVBQzFHLGNBQThFLElBQUksQ0FBQyxNQUFNO0lBRXpGLE1BQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUM7SUFDakMsSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUNaLE1BQU0sSUFBSSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztLQUN4QztJQUVELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFO1FBQ25CLE1BQU0sSUFBSSxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztLQUM1QztJQUVELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2xFLElBQUksQ0FBQyxVQUFVLEVBQUU7UUFDaEIsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0tBQzFDO0lBRUQsTUFBTSxNQUFNLEdBQ1QsMkdBQTJHLENBQUM7SUFFL0csSUFBSSxNQUFNLENBQUMsS0FBSyxJQUFJLFFBQVEsSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFO1FBQzlDLEdBQUcsQ0FDRixhQUFhLENBQUMsS0FBSztRQUNuQiwrQkFBK0I7UUFDL0IsNkJBQTZCLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLE9B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