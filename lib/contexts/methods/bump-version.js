"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: bump-version.ts
 * Path: \src\contexts\methods\bump-version.ts
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
exports.bumpVersion = void 0;
const tslib_1 = require("tslib");
const logging_js_1 = require("../../logging.js");
function bumpVersion() {
    var _a, _b, _c, _d, _e, _f;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const labels = (_a = this.config.manageRelease) === null || _a === void 0 ? void 0 : _a.labels;
        if (!labels || !this.context.props.labels) {
            return;
        }
        if ((!this.runnerConfigs.versioning || this.runnerConfigs.versioning.type === 'semVer')
            && ((_b = this.newVersion) === null || _b === void 0 ? void 0 : _b.semantic)) {
            if (((_c = this.context.props.labels[labels.major]) !== null && _c !== void 0 ? _c : labels.breaking)
                ? this.context.props.labels[labels.major]
                : true) {
                this.newVersion.semantic.major++;
            }
            else if (this.context.props.labels[labels.minor]) {
                this.newVersion.semantic.minor++;
            }
            else if (this.context.props.labels[labels.patch]) {
                this.newVersion.semantic.patch++;
            }
            if (this.context.props.labels[labels.prerelease]) {
                this.newVersion.semantic.prerelease
                    = (_f = (_d = this.newVersion.semantic.prerelease) !== null && _d !== void 0 ? _d : (_e = this.runnerConfigs.versioning) === null || _e === void 0 ? void 0 : _e.prereleaseName) !== null && _f !== void 0 ? _f : 'prerelease';
            }
            if (this.context.props.labels[labels.build]) {
                this.newVersion.semantic.build = +1;
            }
            this.newVersion.name = `${this.newVersion.semantic.major}.${this.newVersion.semantic.minor}.${this.newVersion.semantic.patch}${this.newVersion.semantic.prerelease
                ? `-${this.newVersion.semantic.prerelease}`
                : ''}${this.newVersion.semantic.build ? `+${this.newVersion.semantic.build}` : ''}`;
            (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, `New Version is: ${this.newVersion.name}`);
        }
    });
}
exports.bumpVersion = bumpVersion;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVtcC12ZXJzaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbnRleHRzL21ldGhvZHMvYnVtcC12ZXJzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQ0c7Ozs7QUFFSCxpREFBb0Q7QUFHcEQsU0FBc0IsV0FBVzs7O1FBQ2hDLE1BQU0sTUFBTSxHQUFHLE1BQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLDBDQUFFLE1BQU0sQ0FBQztRQUNqRCxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQzFDLE9BQU87U0FDUDtRQUVELElBQ0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLElBQUksS0FBSyxRQUFRLENBQUM7Z0JBQ2hGLE1BQUEsSUFBSSxDQUFDLFVBQVUsMENBQUUsUUFBUSxDQUFBLEVBQzNCO1lBQ0QsSUFDQyxDQUFBLE1BQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsbUNBQUksTUFBTSxDQUFDLFFBQVE7Z0JBQ3pELENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztnQkFDekMsQ0FBQyxDQUFDLElBQUksRUFDTjtnQkFDRCxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUNqQztpQkFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ25ELElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ2pDO2lCQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDbkQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDakM7WUFFRCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQ2pELElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFVBQVU7c0JBQ2hDLE1BQUEsTUFBQSxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxVQUFVLG1DQUNsQyxNQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSwwQ0FBRSxjQUFjLG1DQUM3QyxZQUFZLENBQUM7YUFDakI7WUFFRCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQzVDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQzthQUNwQztZQUVELElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQ3JGLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFVBQVU7Z0JBQ3ZFLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRTtnQkFDM0MsQ0FBQyxDQUFDLEVBQ0gsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQzNFLEVBQUUsQ0FBQztZQUNILElBQUEsZ0JBQUcsRUFBQywwQkFBYSxDQUFDLEtBQUssRUFBRSxtQkFBbUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1NBQ3BFOztDQUNEO0FBekNELGtDQXlDQyJ9