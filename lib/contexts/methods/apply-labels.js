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
const logging_js_1 = require("../../logging.js");
const evaluator_js_1 = require("../../evaluator.js");
async function applyLabels() {
    if (!this.config?.labels || !this.runnerConfigs.labels) {
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
        evaluator_js_1.evaluator.call(this, conditionsConfig, this.context.props).then(async (shouldHaveLabel) => {
            if (!this.context.props) {
                throw new Error('Props are required');
            }
            // Todo: convert to generic
            // @ts-expect-error needs converting
            const labelName = this.runnerConfigs.labels[labelId];
            if (!labelName) {
                throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, `Can't find configuration for "${labelId}" within labels. Check spelling and that it exists`));
            }
            const hasLabel = Boolean(this.context.props.labels?.[labelName.toLowerCase()]);
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
                await this.util.labels
                    .addRemove(labelName, number, hasLabel, shouldHaveLabel)
                    .catch(async (error) => {
                    throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while running addRemoveLabel: ' + String(error)));
                });
            }
        }).catch((error) => {
            (0, logging_js_1.log)(logging_js_1.LoggingLevels.warn, String(error));
        });
    }
}
exports.applyLabels = applyLabels;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbHktbGFiZWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbnRleHRzL21ldGhvZHMvYXBwbHktbGFiZWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQ0c7OztBQUVILGlEQUFvRDtBQUNwRCxxREFBNkM7QUFHdEMsS0FBSyxVQUFVLFdBQVc7SUFDaEMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUU7UUFDdkQsSUFBQSxnQkFBRyxFQUFDLDBCQUFhLENBQUMsS0FBSyxFQUFFLGtDQUFrQyxDQUFDLENBQUM7UUFDN0QsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO0tBQ3BEO0lBRUQsS0FBSyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FDckMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQ2xCLEVBQUU7UUFDRixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUU7WUFDeEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1NBQ3RDO1FBRUQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVyRCxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7WUFDdEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO1NBQ3ZEO1FBRUQsd0JBQVMsQ0FBQyxJQUFJLENBQ2IsSUFBSSxFQUNKLGdCQUFnQixFQUNoQixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FDbEIsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFDLGVBQWUsRUFBQyxFQUFFO1lBQzlCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRTtnQkFDeEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2FBQ3RDO1lBRUQsMkJBQTJCO1lBQzNCLG9DQUFvQztZQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUUsQ0FBQztZQUN0RCxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBQSxnQkFBRyxFQUNsQiwwQkFBYSxDQUFDLEtBQUssRUFDbkIsaUNBQWlDLE9BQU8sb0RBQW9ELENBQzVGLENBQUMsQ0FBQzthQUNIO1lBRUQsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUN2QixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FDcEQsQ0FBQztZQUNGLElBQUksQ0FBQyxlQUFlLElBQUksUUFBUSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTtnQkFDOUQsZ0VBQWdFO2dCQUNoRSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQzthQUMxRDtZQUVELElBQ0MsZUFBZTttQkFDYixDQUFDLFFBQVE7bUJBQ1QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTTttQkFDekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQ3BCO2dCQUNELE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN2QyxJQUFJLENBQUMsRUFBRTtvQkFDTixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUN2RDthQUNEO1lBRUQsSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUU7Z0JBQ25DLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztnQkFFekMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU07cUJBQ3BCLFNBQVMsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxlQUFlLENBQUM7cUJBQ3ZELEtBQUssQ0FBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEVBQUU7b0JBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBQSxnQkFBRyxFQUNsQiwwQkFBYSxDQUFDLEtBQUssRUFDbkIsNkNBQTZDLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUM3RCxDQUFDLENBQUM7Z0JBQ0osQ0FBQyxDQUFDLENBQUM7YUFDSjtRQUNGLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQWMsRUFBRSxFQUFFO1lBQzNCLElBQUEsZ0JBQUcsRUFBQywwQkFBYSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUN4QyxDQUFDLENBQUMsQ0FBQztLQUNIO0FBQ0YsQ0FBQztBQTFFRCxrQ0EwRUMifQ==