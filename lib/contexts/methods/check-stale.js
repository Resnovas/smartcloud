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
const tslib_1 = require("tslib");
const logging_js_1 = require("../../logging.js");
const evaluator_js_1 = require("../../evaluator.js");
function checkStale(context = this.context, configlocal = this.config) {
    var _a, _b, _c, _d, _e, _f;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const config = configlocal.stale;
        if (!config) {
            throw new Error('Stale is not enabled');
        }
        if (!context.props) {
            throw new Error('Context Props must exist');
        }
        const staleLabel = (_a = this.runnerConfigs.labels) === null || _a === void 0 ? void 0 : _a[config.staleLabel];
        if (!staleLabel) {
            throw new Error('Stale Label must exist');
        }
        const suffix = '\r\n\r\n----------\r\n\r\nSimply comment, assign or modify this issue to remove the stale status \r\n\r\n';
        if (config.stale && 'number' in context.props) {
            (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, 
            // @ts-expect-error known issue
            `Checking stale status for ${context.props.type} ${context.props.number} - ${String(context.props.title)}`);
            if (!((_b = config.stale.condition) === null || _b === void 0 ? void 0 : _b.find(condition => condition.type === 'isStale'))) {
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
            const stale = yield evaluator_js_1.evaluator.call(this, config.stale, context.props);
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
                yield this.createComment.bind(this)('stale', isstale, {
                    body: (isstale ? String(config.stale.comment) : String(config.stale.resolve))
                        + '\r\n\r\n'
                        + suffix.toString()
                        + String((_c = config.stale.commentFooter) !== null && _c !== void 0 ? _c : ''),
                });
            }
        }
        if (config.abandoned && 'number' in context.props) {
            (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, 
            // @ts-expect-error known issue
            `Checking abandoned status for ${context.props.type} ${String(context.props.number)} - ${String(context.props.title)}`);
            if (!((_d = config.abandoned.condition) === null || _d === void 0 ? void 0 : _d.find(condition => condition.type === 'isAbandoned'))) {
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
            const abandoned = yield evaluator_js_1.evaluator.call(this, config.abandoned, context.props);
            (0, logging_js_1.log)(logging_js_1.LoggingLevels.notice, 
            // @ts-expect-error known issue
            `Abandoned status for ${String(context.props.title)}: ${String(abandoned)}`);
            const abandonedLabel = (_e = this.runnerConfigs.labels) === null || _e === void 0 ? void 0 : _e[config.abandoned.label];
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
                yield this.createComment.bind(this)('stale', isAbandoned, {
                    body: String((isAbandoned ? config.abandoned.comment : config.abandoned.resolve))
                        + '\r\n\r\n'
                        + String(suffix)
                        + String((_f = config.abandoned.commentFooter) !== null && _f !== void 0 ? _f : ''),
                });
            }
        }
    });
}
exports.checkStale = checkStale;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2stc3RhbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udGV4dHMvbWV0aG9kcy9jaGVjay1zdGFsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHOzs7O0FBSUgsaURBQW9EO0FBRXBELHFEQUE2QztBQXFFN0MsU0FBc0IsVUFBVSxDQUUvQixVQUE4RixJQUFJLENBQUMsT0FBTyxFQUMxRyxjQUE4RSxJQUFJLENBQUMsTUFBTTs7O1FBRXpGLE1BQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUM7UUFDakMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNaLE1BQU0sSUFBSSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztTQUN4QztRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFO1lBQ25CLE1BQU0sSUFBSSxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztTQUM1QztRQUVELE1BQU0sVUFBVSxHQUFHLE1BQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLDBDQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNsRSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztTQUMxQztRQUVELE1BQU0sTUFBTSxHQUNULDJHQUEyRyxDQUFDO1FBRS9HLElBQUksTUFBTSxDQUFDLEtBQUssSUFBSSxRQUFRLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRTtZQUM5QyxJQUFBLGdCQUFHLEVBQ0YsMEJBQWEsQ0FBQyxLQUFLO1lBQ25CLCtCQUErQjtZQUMvQiw2QkFBNkIsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLE1BQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVB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