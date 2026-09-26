"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRemove = exports.sync = void 0;
const logging_js_1 = require("../logging.js");
const parsing_data_js_1 = require("./parsing-data.js");
/**
 * Syncronise labels to repository
 * @author IvanFon, TGTGamer, jbinda
 * @since 1.0.0
 */
async function sync(config) {
    /**
     * Syncronises the repo labels
     * !todo Add delete labels
     * @since 2.0.0
     */
    if (!config) {
        throw new Error('Cannot syncronise labels without config');
    }
    const curLabels = await this.api.labels.get();
    (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, `curLabels: ${JSON.stringify(curLabels)}`);
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
                || label.color !== (0, parsing_data_js_1.formatColor)(configLabel.color)) {
                (0, logging_js_1.log)(logging_js_1.LoggingLevels.info, `Recreate ${JSON.stringify(configLabel)} (prev: ${JSON.stringify(label)})`);
                await this.api.labels.update(label.name, configLabel).catch(async (error) => {
                    throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while updating label: ' + String(error)));
                });
            }
            else {
                (0, logging_js_1.log)(logging_js_1.LoggingLevels.info, `No action required to update label: ${label.name}`);
            }
            /**
             * Create label
             * @author IvanFon, TGTGamer, jbinda
             * @since 1.0.0
             */
        }
        else {
            (0, logging_js_1.log)(logging_js_1.LoggingLevels.info, `Create ${JSON.stringify(configLabel)}`);
            await this.api.labels.create(configLabel).catch(async (error) => {
                throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while creating label: ' + String(error)));
            });
        }
    }
    if (this.skipDelete) {
        (0, logging_js_1.log)(logging_js_1.LoggingLevels.warn, 'Skipping deletion of labels');
    }
    else {
        for (const curLabel of Object.values(curLabels)) {
            const label = config[curLabel.name.toLowerCase()];
            if (!label) {
                (0, logging_js_1.log)(logging_js_1.LoggingLevels.warn, `Delete ${JSON.stringify(curLabel)}`);
                await this.api.labels.del(curLabel.name).catch(async (error) => {
                    throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while deleting label: ' + String(error)));
                });
            }
        }
    }
}
exports.sync = sync;
/**
 * Add or Remove Labels
 * @author IvanFon, TGTGamer, jbinda
 * @since 1.0.0
 */
async function addRemove(labelName, IDNumber, hasLabel, shouldHaveLabel) {
    if (!labelName) {
        throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.info, `Can't run add or remove labels if you don't provide the name of the label you want to apply: ${labelName}`));
    }
    (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, `Current label: ${labelName.toLowerCase()} -- Does issue have label: ${String(hasLabel)} but should it: ${String(shouldHaveLabel)}`);
    if (shouldHaveLabel && !hasLabel) {
        (0, logging_js_1.log)(logging_js_1.LoggingLevels.info, `Adding label "${labelName}"...`);
        await this.api.labels.add(IDNumber, labelName).catch(async (error) => {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while adding labels: ' + String(error)));
        });
    }
    else if (!shouldHaveLabel && hasLabel) {
        (0, logging_js_1.log)(logging_js_1.LoggingLevels.info, `Removing label "${labelName}"...`);
        await this.api.labels.remove(IDNumber, labelName).catch(async (error) => {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while removing labels: ' + String(error)));
        });
    }
    else {
        (0, logging_js_1.log)(logging_js_1.LoggingLevels.info, `No action required for label "${labelName}"${hasLabel ? ' as label is already applied.' : '.'}`);
    }
}
exports.addRemove = addRemove;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFiZWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2xhYmVscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHO0FBQ0gscUNBQXFDOzs7QUFFckMsOENBQWlEO0FBRWpELHVEQUE4QztBQUc5Qzs7OztHQUlHO0FBQ0ksS0FBSyxVQUFVLElBQUksQ0FBYyxNQUF5QjtJQUNoRTs7OztPQUlHO0lBQ0gsSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUNaLE1BQU0sSUFBSSxLQUFLLENBQUMseUNBQXlDLENBQUMsQ0FBQztLQUMzRDtJQUVELE1BQU0sU0FBUyxHQUFXLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7SUFFdEQsSUFBQSxnQkFBRyxFQUFDLDBCQUFhLENBQUMsS0FBSyxFQUFFLGNBQWMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDcEUsS0FBSyxNQUFNLFdBQVcsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBQ2hELE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFFeEQ7Ozs7V0FJRztRQUNILElBQUksS0FBSyxFQUFFO1lBQ1YsSUFDQyxLQUFLLENBQUMsSUFBSSxLQUFLLFdBQVcsQ0FBQyxJQUFJO21CQUM1QixDQUFDLEtBQUssQ0FBQyxXQUFXLEtBQUssV0FBVyxDQUFDLFdBQVc7dUJBQzdDLFdBQVcsQ0FBQyxXQUFXLEtBQUssU0FBUyxDQUFDO21CQUN2QyxLQUFLLENBQUMsS0FBSyxLQUFLLElBQUEsNkJBQVcsRUFBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEVBQ2hEO2dCQUNELElBQUEsZ0JBQUcsRUFDRiwwQkFBYSxDQUFDLElBQUksRUFD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