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
const tslib_1 = require("tslib");
const logging_js_1 = require("../logging.js");
const parsing_data_js_1 = require("./parsing-data.js");
/**
 * Syncronise labels to repository
 * @author IvanFon, TGTGamer, jbinda
 * @since 1.0.0
 */
function sync(config) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        /**
         * Syncronises the repo labels
         * !todo Add delete labels
         * @since 2.0.0
         */
        if (!config) {
            throw new Error('Cannot syncronise labels without config');
        }
        const curLabels = yield this.api.labels.get();
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
                    yield this.api.labels.update(label.name, configLabel).catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while updating label: ' + String(error)));
                    }));
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
                yield this.api.labels.create(configLabel).catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while creating label: ' + String(error)));
                }));
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
                    yield this.api.labels.del(curLabel.name).catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while deleting label: ' + String(error)));
                    }));
                }
            }
        }
    });
}
exports.sync = sync;
/**
 * Add or Remove Labels
 * @author IvanFon, TGTGamer, jbinda
 * @since 1.0.0
 */
function addRemove(labelName, IDNumber, hasLabel, shouldHaveLabel) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!labelName) {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.info, `Can't run add or remove labels if you don't provide the name of the label you want to apply: ${labelName}`));
        }
        (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, `Current label: ${labelName.toLowerCase()} -- Does issue have label: ${String(hasLabel)} but should it: ${String(shouldHaveLabel)}`);
        if (shouldHaveLabel && !hasLabel) {
            (0, logging_js_1.log)(logging_js_1.LoggingLevels.info, `Adding label "${labelName}"...`);
            yield this.api.labels.add(IDNumber, labelName).catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while adding labels: ' + String(error)));
            }));
        }
        else if (!shouldHaveLabel && hasLabel) {
            (0, logging_js_1.log)(logging_js_1.LoggingLevels.info, `Removing label "${labelName}"...`);
            yield this.api.labels.remove(IDNumber, labelName).catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while removing labels: ' + String(error)));
            }));
        }
        else {
            (0, logging_js_1.log)(logging_js_1.LoggingLevels.info, `No action required for label "${labelName}"${hasLabel ? ' as label is already applied.' : '.'}`);
        }
    });
}
exports.addRemove = addRemove;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFiZWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2xhYmVscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHO0FBQ0gscUNBQXFDOzs7O0FBRXJDLDhDQUFpRDtBQUVqRCx1REFBOEM7QUFHOUM7Ozs7R0FJRztBQUNILFNBQXNCLElBQUksQ0FBYyxNQUF5Qjs7UUFDaEU7Ozs7V0FJRztRQUNILElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDWixNQUFNLElBQUksS0FBSyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7U0FDM0Q7UUFFRCxNQUFNLFNBQVMsR0FBVyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRXRELElBQUEsZ0JBQUcsRUFBQywwQkFBYSxDQUFDLEtBQUssRUFBRSxjQUFjLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3BFLEtBQUssTUFBTSxXQUFXLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUNoRCxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBRXhEOzs7O2VBSUc7WUFDSCxJQUFJLEtBQUssRUFBRTtnQkFDVixJQUNDLEtBQUssQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFDLElBQUk7dUJBQzVCLENBQUMsS0FBSyxDQUFDLFdBQVcsS0FBSyxXQUFXLENBQUMsV0FBVzsyQkFDN0MsV0FBVyxDQUFDLFdBQVcsS0FBSyxTQUFTLENBQUM7dUJBQ3ZDLEtBQUssQ0FBQyxLQUFLLEtBQUssSUFBQSw2QkFBVyxFQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFDaEQ7b0JBQ0QsSUFBQSxnQkFBRyxFQUNGLDBCQUFhLENBQUMsSUFBSSxFQUNs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