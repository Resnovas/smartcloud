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
import { log, LoggingLevels } from '../../logging.js';
import { evaluator } from '../../evaluator.js';
export async function applyLabels() {
    if (!this.config?.labels || !this.runnerConfigs.labels) {
        log(LoggingLevels.error, 'Config is required to add labels');
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
        evaluator.call(this, conditionsConfig, this.context.props).then(async (shouldHaveLabel) => {
            if (!this.context.props) {
                throw new Error('Props are required');
            }
            // Todo: convert to generic
            // @ts-expect-error needs converting
            const labelName = this.runnerConfigs.labels[labelId];
            if (!labelName) {
                throw new Error(log(LoggingLevels.error, `Can't find configuration for "${labelId}" within labels. Check spelling and that it exists`));
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
                    throw new Error(log(LoggingLevels.error, 'Error thrown while running addRemoveLabel: ' + String(error)));
                });
            }
        }).catch((error) => {
            log(LoggingLevels.warn, String(error));
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbHktbGFiZWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbnRleHRzL21ldGhvZHMvYXBwbHktbGFiZWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNDRztBQUVILE9BQU8sRUFBQyxHQUFHLEVBQUUsYUFBYSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDcEQsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBRzdDLE1BQU0sQ0FBQyxLQUFLLFVBQVUsV0FBVztJQUNoQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRTtRQUN2RCxHQUFHLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxrQ0FBa0MsQ0FBQyxDQUFDO1FBQzdELE1BQU0sSUFBSSxLQUFLLENBQUMsa0NBQWtDLENBQUMsQ0FBQztLQUNwRDtJQUVELEtBQUssTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUNsQixFQUFFO1FBQ0YsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFO1lBQ3hCLE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQztTQUN0QztRQUVELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFckQsSUFBSSxDQUFDLGdCQUFnQixFQUFFO1lBQ3RCLE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztTQUN2RDtRQUVELFNBQVMsQ0FBQyxJQUFJLENBQ2IsSUFBSSxFQUNKLGdCQUFnQixFQUNoQixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FDbEIsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFDLGVBQWUsRUFBQyxFQUFFO1lBQzlCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRTtnQkFDeEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2FBQ3RDO1lBRUQsMkJBQTJCO1lBQzNCLG9DQUFvQztZQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUUsQ0FBQztZQUN0RCxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxDQUNsQixhQUFhLENBQUMsS0FBSyxFQUNuQixpQ0FBaUMsT0FBTyxvREFBb0QsQ0FDNUYsQ0FBQyxDQUFDO2FBQ0g7WUFFRCxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQ3ZCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUNwRCxDQUFDO1lBQ0YsSUFBSSxDQUFDLGVBQWUsSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO2dCQUM5RCxnRUFBZ0U7Z0JBQ2hFLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO2FBQzFEO1lBRUQsSUFDQyxlQUFlO21CQUNiLENBQUMsUUFBUTttQkFDVCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNO21CQUN6QixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFDcEI7Z0JBQ0QsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3ZDLElBQUksQ0FBQyxFQUFFO29CQUNOLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ3ZEO2FBQ0Q7WUFFRCxJQUFJLFFBQVEsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRTtnQkFDbkMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO2dCQUV6QyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTTtxQkFDcEIsU0FBUyxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLGVBQWUsQ0FBQztxQkFDdkQsS0FBSyxDQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsRUFBRTtvQkFDcEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQ2xCLGFBQWEsQ0FBQyxLQUFLLEVBQ25CLDZDQUE2QyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FDN0QsQ0FBQyxDQUFDO2dCQUNKLENBQUMsQ0FBQyxDQUFDO2FBQ0o7UUFDRixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFjLEVBQUUsRUFBRTtZQUMzQixHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUN4QyxDQUFDLENBQUMsQ0FBQztLQUNIO0FBQ0YsQ0FBQyJ9