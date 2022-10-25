/*
 * Project: @resnovas/smartcloud
 * File: labels.ts
 * Path: \src\utils\labels.ts
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
import { log, LoggingLevels } from '../logging.js';
import { formatColor } from './parsing-data.js';
/**
 * Syncronise labels to repository
 * @author IvanFon, TGTGamer, jbinda
 * @since 1.0.0
 */
export async function sync(config) {
    /**
     * Syncronises the repo labels
     * !todo Add delete labels
     * @since 2.0.0
     */
    if (!config) {
        throw new Error('Cannot syncronise labels without config');
    }
    const curLabels = await this.api.labels.get();
    log(LoggingLevels.debug, `curLabels: ${JSON.stringify(curLabels)}`);
    for (const configLabel of Object.values(config)) {
        const label = curLabels[configLabel.name.toLowerCase()];
        /**
         * Update label
         * @author IvanFon, TGTGamer, jbinda
         * @since 1.0.0
         */
        if (label) {
            if (label.name !== configLabel.name
                || (label.description !== configLabel.description
                    && configLabel.description !== undefined)
                || label.color !== formatColor(configLabel.color)) {
                log(LoggingLevels.info, `Recreate ${JSON.stringify(configLabel)} (prev: ${JSON.stringify(label)})`);
                await this.api.labels.update(label.name, configLabel).catch(async (error) => {
                    throw new Error(log(LoggingLevels.error, 'Error thrown while updating label: ' + String(error)));
                });
            }
            else {
                log(LoggingLevels.info, `No action required to update label: ${label.name}`);
            }
            /**
             * Create label
             * @author IvanFon, TGTGamer, jbinda
             * @since 1.0.0
             */
        }
        else {
            log(LoggingLevels.info, `Create ${JSON.stringify(configLabel)}`);
            await this.api.labels.create(configLabel).catch(async (error) => {
                throw new Error(log(LoggingLevels.error, 'Error thrown while creating label: ' + String(error)));
            });
        }
    }
    if (this.skipDelete) {
        log(LoggingLevels.warn, 'Skipping deletion of labels');
    }
    else {
        for (const curLabel of Object.values(curLabels)) {
            const label = config[curLabel.name.toLowerCase()];
            if (!label) {
                log(LoggingLevels.warn, `Delete ${JSON.stringify(curLabel)}`);
                await this.api.labels.del(curLabel.name).catch(async (error) => {
                    throw new Error(log(LoggingLevels.error, 'Error thrown while deleting label: ' + String(error)));
                });
            }
        }
    }
}
/**
 * Add or Remove Labels
 * @author IvanFon, TGTGamer, jbinda
 * @since 1.0.0
 */
export async function addRemove(labelName, IDNumber, hasLabel, shouldHaveLabel) {
    if (!labelName) {
        throw new Error(log(LoggingLevels.info, `Can't run add or remove labels if you don't provide the name of the label you want to apply: ${labelName}`));
    }
    log(LoggingLevels.debug, `Current label: ${labelName.toLowerCase()} -- Does issue have label: ${String(hasLabel)} but should it: ${String(shouldHaveLabel)}`);
    if (shouldHaveLabel && !hasLabel) {
        log(LoggingLevels.info, `Adding label "${labelName}"...`);
        await this.api.labels.add(IDNumber, labelName).catch(async (error) => {
            throw new Error(log(LoggingLevels.error, 'Error thrown while adding labels: ' + String(error)));
        });
    }
    else if (!shouldHaveLabel && hasLabel) {
        log(LoggingLevels.info, `Removing label "${labelName}"...`);
        await this.api.labels.remove(IDNumber, labelName).catch(async (error) => {
            throw new Error(log(LoggingLevels.error, 'Error thrown while removing labels: ' + String(error)));
        });
    }
    else {
        log(LoggingLevels.info, `No action required for label "${labelName}"${hasLabel ? ' as label is already applied.' : '.'}`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFiZWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2xhYmVscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQ0c7QUFDSCxxQ0FBcUM7QUFFckMsT0FBTyxFQUFDLEdBQUcsRUFBRSxhQUFhLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFakQsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBRzlDOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsS0FBSyxVQUFVLElBQUksQ0FBYyxNQUF5QjtJQUNoRTs7OztPQUlHO0lBQ0gsSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUNaLE1BQU0sSUFBSSxLQUFLLENBQUMseUNBQXlDLENBQUMsQ0FBQztLQUMzRDtJQUVELE1BQU0sU0FBUyxHQUFXLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7SUFFdEQsR0FBRyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsY0FBYyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNwRSxLQUFLLE1BQU0sV0FBVyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDaEQsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUV4RDs7OztXQUlHO1FBQ0gsSUFBSSxLQUFLLEVBQUU7WUFDVixJQUNDLEtBQUssQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFDLElBQUk7bUJBQzVCLENBQUMsS0FBSyxDQUFDLFdBQVcsS0FBSyxXQUFXLENBQUMsV0FBVzt1QkFDN0MsV0FBVyxDQUFDLFdBQVcsS0FBSyxTQUFTLENBQUM7bUJBQ3ZDLEtBQUssQ0FBQyxLQUFLLEtBQUssV0FBVyxDQUFDLFdBQVcs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