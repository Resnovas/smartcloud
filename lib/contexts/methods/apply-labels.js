"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: apply-labels.ts
 * Path: \src\contexts\methods\apply-labels.ts
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
exports.applyLabels = void 0;
const tslib_1 = require("tslib");
const logging_js_1 = require("../../logging.js");
const evaluator_js_1 = require("../../evaluator.js");
function applyLabels() {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!((_a = this.config) === null || _a === void 0 ? void 0 : _a.labels) || !this.runnerConfigs.labels) {
            (0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Config is required to add labels');
            throw new Error('Config is required to add labels');
        }
        for (const [labelId] of Object.entries(this.config.labels)) {
            if (!this.context.props) {
                throw new Error('Props are required');
            }
            const conditionsConfig = this.config.labels[labelId];
            if (!conditionsConfig) {
                throw new Error('Configuration for label is required');
            }
            evaluator_js_1.evaluator.call(this, conditionsConfig, this.context.props).then((shouldHaveLabel) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                var _b;
                if (!this.context.props) {
                    throw new Error('Props are required');
                }
                // Todo: convert to generic
                // @ts-expect-error needs converting
                const labelName = this.runnerConfigs.labels[labelId];
                if (!labelName) {
                    throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, `Can't find configuration for "${labelId}" within labels. Check spelling and that it exists`));
                }
                const hasLabel = Boolean((_b = this.context.props.labels) === null || _b === void 0 ? void 0 : _b[labelName.toLowerCase()]);
                if (!shouldHaveLabel && hasLabel && this.context.props.labels) {
                    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                    delete this.context.props.labels[labelName.toLowerCase()];
                }
                if (shouldHaveLabel
                    && !hasLabel
                    && this.context.props.labels
                    && this.runners.labels) {
                    const l = this.runners.labels[labelId];
                    if (l) {
                        this.context.props.labels[labelName.toLowerCase()] = l;
                    }
                }
                if ('number' in this.context.props) {
                    const number = this.context.props.number;
                    yield this.util.labels
                        .addRemove(labelName, number, hasLabel, shouldHaveLabel)
                        .catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while running addRemoveLabel: ' + String(error)));
                    }));
                }
            })).catch((error) => {
                (0, logging_js_1.log)(logging_js_1.LoggingLevels.warn, String(error));
            });
        }
    });
}
exports.applyLabels = applyLabels;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbHktbGFiZWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbnRleHRzL21ldGhvZHMvYXBwbHktbGFiZWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQ0c7Ozs7QUFFSCxpREFBb0Q7QUFDcEQscURBQTZDO0FBRzdDLFNBQXNCLFdBQVc7OztRQUNoQyxJQUFJLENBQUMsQ0FBQSxNQUFBLElBQUksQ0FBQyxNQUFNLDBDQUFFLE1BQU0sQ0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUU7WUFDdkQsSUFBQSxnQkFBRyxFQUFDLDBCQUFhLENBQUMsS0FBSyxFQUFFLGtDQUFrQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO1NBQ3BEO1FBRUQsS0FBSyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FDckMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQ2xCLEVBQUU7WUFDRixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUU7Z0JBQ3hCLE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQzthQUN0QztZQUVELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFckQsSUFBSSxDQUFDLGdCQUFnQixFQUFFO2dCQUN0QixNQUFNLElBQUksS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7YUFDdkQ7WUFFRCx3QkFBUyxDQUFDLElBQUksQ0FDYixJQUFJLEVBQ0osZ0JBQWdCLEVBQ2hCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUNsQixDQUFDLElBQUksQ0FBQyxDQUFNLGVBQWUsRUFBQyxFQUFFOztnQkFDOUIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFO29CQUN4QixNQUFNLElBQUksS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7aUJBQ3RDO2dCQUVELDJCQUEyQjtnQkFDM0Isb0NBQW9DO2dCQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUUsQ0FBQztnQkFDdEQsSUFBSSxDQUFDLFNBQVMsRUFBRTtvQkFDZixNQUFNLElBQUksS0FBSyxDQUFDLElBQUEsZ0JBQUcsRUFDbEIsMEJBQWEsQ0FBQyxLQUFLLEVBQ25CLGlDQUFpQyxPQUFPLG9EQUFvRCxDQUM1RixDQUFDLENBQUM7aUJBQ0g7Z0JBRUQsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUN2QixNQUFBLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sMENBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQ3BELENBQUM7Z0JBQ0YsSUFBSSxDQUFDLGVBQWUsSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO29CQUM5RCxnRUFBZ0U7b0JBQ2hFLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO2lCQUMxRDtnQkFFRCxJQUNDLGVBQWU7dUJBQ2IsQ0FBQyxRQUFRO3VCQUNULElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU07dUJBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUNwQjtvQkFDRCxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDdkMsSUFBSSxDQUFDLEVBQUU7d0JBQ04sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztxQkFDdkQ7aUJBQ0Q7Z0JBRUQsSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUU7b0JBQ25DLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztvQkFFekMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU07eUJBQ3BCLFNBQVMsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxlQUFlLENBQUM7eUJBQ3ZELEtBQUssQ0FBQyxDQUFNLEtBQUssRUFBQyxFQUFFO3dCQUNwQixNQUFNLElBQUksS0FBSyxDQUFDLElBQUEsZ0JBQUcsRUFDbEIsMEJBQWEsQ0FBQyxLQUFLLEVBQ25CLDZDQUE2QyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FDN0QsQ0FBQyxDQUFDO29CQUNKLENBQUMsQ0FBQSxDQUFDLENBQUM7aUJBQ0o7WUFDRixDQUFDLENBQUEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQWMsRUFBRSxFQUFFO2dCQUMzQixJQUFBLGdCQUFHLEVBQUMsMEJBQWEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDeEMsQ0FBQyxDQUFDLENBQUM7U0FDSDs7Q0FDRDtBQTFFRCxrQ0EwRUMifQ==