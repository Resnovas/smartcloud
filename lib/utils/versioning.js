"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: versioning.ts
 * Path: \src\utils\versioning.ts
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
exports.getNodeVersion = exports.parse = void 0;
const tslib_1 = require("tslib");
const node_path_1 = tslib_1.__importDefault(require("node:path"));
const logging_js_1 = require("../logging.js");
/**
 * Gets the version information
 * @author IvanFon, TGTGamer
 * @since 1.0.0
 */
function parse(config, ref) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let rawVersion;
        if (!config.branch) {
            config.branch = 'master';
        }
        if (((_a = config.versioning) === null || _a === void 0 ? void 0 : _a.source) === 'node') {
            rawVersion = yield getNodeVersion
                .call(this, config.branch, ref)
                .catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while parsing node project: ' + String(error)));
            }));
        }
        else if (((_b = config.versioning) === null || _b === void 0 ? void 0 : _b.source) === 'milestones') {
            // Todo: Add milestone passing
        }
        else if ((_c = config.versioning) === null || _c === void 0 ? void 0 : _c.source) {
            rawVersion = config.versioning.source;
        }
        else {
            throw new Error('There isn\'t any version to use');
        }
        if (!rawVersion) {
            rawVersion = '0.0.0';
        }
        if (((_d = config.versioning) === null || _d === void 0 ? void 0 : _d.type) === 'semVer' || !config.versioning.type) {
            const semVer = rawVersion.split('.');
            const plus = (_e = semVer[2]) === null || _e === void 0 ? void 0 : _e.split('+');
            const patch = (_g = (_f = plus === null || plus === void 0 ? void 0 : plus[0]) === null || _f === void 0 ? void 0 : _f.split('-')) === null || _g === void 0 ? void 0 : _g[0];
            if (!semVer || !semVer[0] || !semVer[1] || !semVer[2] || !patch) {
                throw new Error('semVer versioning is not valid');
            }
            const versioning = {
                major: Number(semVer[0]),
                minor: Number(semVer[1]),
                patch: Number(patch),
                prerelease: (_k = (_j = (_h = rawVersion.split('-')) === null || _h === void 0 ? void 0 : _h[1]) === null || _j === void 0 ? void 0 : _j.split('+')) === null || _k === void 0 ? void 0 : _k[0],
                build: (plus === null || plus === void 0 ? void 0 : plus[1]) ? Number(plus[1]) : undefined,
            };
            return { semantic: versioning };
        }
        return { name: rawVersion };
    });
}
exports.parse = parse;
function getNodeVersion(root, ref) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const file = node_path_1.default.join(root, '/package.json');
        (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, `Getting file: ${file}`);
        return JSON.parse(yield this.api.files.get(file, ref)).version;
    });
}
exports.getNodeVersion = getNodeVersion;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyc2lvbmluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy92ZXJzaW9uaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQ0c7Ozs7QUFFSCxrRUFBNkI7QUFDN0IsOENBQWlEO0FBS2pEOzs7O0dBSUc7QUFDSCxTQUFzQixLQUFLLENBRTFCLE1BQWMsRUFDZCxHQUFZOzs7UUFFWixJQUFJLFVBQVUsQ0FBQztRQUNmLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQ25CLE1BQU0sQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDO1NBQ3pCO1FBRUQsSUFBSSxDQUFBLE1BQUEsTUFBTSxDQUFDLFVBQVUsMENBQUUsTUFBTSxNQUFLLE1BQU0sRUFBRTtZQUN6QyxVQUFVLEdBQUcsTUFBTSxjQUFjO2lCQUMvQixJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDO2lCQUM5QixLQUFLLENBQUMsQ0FBTSxLQUFLLEVBQUMsRUFBRTtnQkFDcEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFBLGdCQUFHLEVBQ2xCLDBCQUFhLENBQUMsS0FBSyxFQUNuQiwyQ0FBMkMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQzNELENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQSxDQUFDLENBQUM7U0FDSjthQUFNLElBQUksQ0FBQSxNQUFBLE1BQU0sQ0FBQyxVQUFVLDBDQUFFLE1BQU0sTUFBSyxZQUFZLEVBQUU7WUFDdEQsOEJBQThCO1NBQzlCO2FBQU0sSUFBSSxNQUFBLE1BQU0sQ0FBQyxVQUFVLDBDQUFFLE1BQU0sRUFBRTtZQUNyQyxVQUFVLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7U0FDdEM7YUFBTTtZQUNOLE1BQU0sSUFBSSxLQUFLLENBQUMsaUNBQWlDLENBQUMsQ0FBQztTQUNuRDtRQUVELElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDaEIsVUFBVSxHQUFHLE9BQU8sQ0FBQztTQUNyQjtRQUVELElBQUksQ0FBQSxNQUFBLE1BQU0sQ0FBQyxVQUFVLDBDQUFFLElBQUksTUFBSyxRQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRTtZQUNwRSxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sSUFBSSxHQUFHLE1BQUEsTUFBTSxDQUFDLENBQUMsQ0FBQywwQ0FBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbkMsTUFBTSxLQUFLLEdBQUcsTUFBQSxNQUFBLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRyxDQUFDLENBQUMsMENBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQywwQ0FBRyxDQUFDLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNoRSxNQUFNLElBQUksS0FBSyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7YUFDbEQ7WUFFRCxNQUFNLFVBQVUsR0FBd0I7Z0JBQ3ZDLEtBQUssRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixLQUFLLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDeEIsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUM7Z0JBQ3BCLFVBQVUsRUFBRSxNQUFBLE1BQUEsTUFBQSxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQywwQ0FBRyxDQUFDLENBQUMsMENBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQywwQ0FBRyxDQUFDLENBQUM7Z0JBQ3ZELEtBQUssRUFBRSxDQUFBLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO2FBQzlDLENBQUM7WUFDRixPQUFPLEVBQUMsUUFBUSxFQUFFLFVBQVUsRUFBQyxDQUFDO1NBQzlCO1FBRUQsT0FBTyxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUMsQ0FBQzs7Q0FDMUI7QUFsREQsc0JBa0RDO0FBRUQsU0FBc0IsY0FBYyxDQUVuQyxJQUFZLEVBQ1osR0FBWTs7UUFFWixNQUFNLElBQUksR0FBRyxtQkFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDOUMsSUFBQSxnQkFBRyxFQUFDLDBCQUFhLENBQUMsS0FBSyxFQUFFLGlCQUFpQixJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ2xELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFpQixDQUFDO0lBQzFFLENBQUM7Q0FBQTtBQVJELHdDQVFDIn0=