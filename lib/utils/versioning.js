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
async function parse(config, ref) {
    let rawVersion;
    if (!config.branch) {
        config.branch = 'master';
    }
    if (config.versioning?.source === 'node') {
        rawVersion = await getNodeVersion
            .call(this, config.branch, ref)
            .catch(async (error) => {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while parsing node project: ' + String(error)));
        });
    }
    else if (config.versioning?.source === 'milestones') {
        // Todo: Add milestone passing
    }
    else if (config.versioning?.source) {
        rawVersion = config.versioning.source;
    }
    else {
        throw new Error('There isn\'t any version to use');
    }
    if (!rawVersion) {
        rawVersion = '0.0.0';
    }
    if (config.versioning?.type === 'semVer' || !config.versioning.type) {
        const semVer = rawVersion.split('.');
        const plus = semVer[2]?.split('+');
        const patch = plus?.[0]?.split('-')?.[0];
        if (!semVer || !semVer[0] || !semVer[1] || !semVer[2] || !patch) {
            throw new Error('semVer versioning is not valid');
        }
        const versioning = {
            major: Number(semVer[0]),
            minor: Number(semVer[1]),
            patch: Number(patch),
            prerelease: rawVersion.split('-')?.[1]?.split('+')?.[0],
            build: plus?.[1] ? Number(plus[1]) : undefined,
        };
        return { semantic: versioning };
    }
    return { name: rawVersion };
}
exports.parse = parse;
async function getNodeVersion(root, ref) {
    const file = node_path_1.default.join(root, '/package.json');
    (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, `Getting file: ${file}`);
    return JSON.parse(await this.api.files.get(file, ref)).version;
}
exports.getNodeVersion = getNodeVersion;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyc2lvbmluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy92ZXJzaW9uaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQ0c7Ozs7QUFFSCxrRUFBNkI7QUFDN0IsOENBQWlEO0FBS2pEOzs7O0dBSUc7QUFDSSxLQUFLLFVBQVUsS0FBSyxDQUUxQixNQUFjLEVBQ2QsR0FBWTtJQUVaLElBQUksVUFBVSxDQUFDO0lBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7UUFDbkIsTUFBTSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUM7S0FDekI7SUFFRCxJQUFJLE1BQU0sQ0FBQyxVQUFVLEVBQUUsTUFBTSxLQUFLLE1BQU0sRUFBRTtRQUN6QyxVQUFVLEdBQUcsTUFBTSxjQUFjO2FBQy9CLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUM7YUFDOUIsS0FBSyxDQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsRUFBRTtZQUNwQixNQUFNLElBQUksS0FBSyxDQUFDLElBQUEsZ0JBQUcsRUFDbEIsMEJBQWEsQ0FBQyxLQUFLLEVBQ25CLDJDQUEyQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FDM0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7S0FDSjtTQUFNLElBQUksTUFBTSxDQUFDLFVBQVUsRUFBRSxNQUFNLEtBQUssWUFBWSxFQUFFO1FBQ3RELDhCQUE4QjtLQUM5QjtTQUFNLElBQUksTUFBTSxDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUU7UUFDckMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDO0tBQ3RDO1NBQU07UUFDTixNQUFNLElBQUksS0FBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7S0FDbkQ7SUFFRCxJQUFJLENBQUMsVUFBVSxFQUFFO1FBQ2hCLFVBQVUsR0FBRyxPQUFPLENBQUM7S0FDckI7SUFFRCxJQUFJLE1BQU0sQ0FBQyxVQUFVLEVBQUUsSUFBSSxLQUFLLFFBQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFO1FBQ3BFLE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDckMsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuQyxNQUFNLEtBQUssR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ2hFLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztTQUNsRDtRQUVELE1BQU0sVUFBVSxHQUF3QjtZQUN2QyxLQUFLLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QixLQUFLLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QixLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUNwQixVQUFVLEVBQUUsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2RCxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztTQUM5QyxDQUFDO1FBQ0YsT0FBTyxFQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUMsQ0FBQztLQUM5QjtJQUVELE9BQU8sRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFDLENBQUM7QUFDM0IsQ0FBQztBQWxERCxzQkFrREM7QUFFTSxLQUFLLFVBQVUsY0FBYyxDQUVuQyxJQUFZLEVBQ1osR0FBWTtJQUVaLE1BQU0sSUFBSSxHQUFHLG1CQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxlQUFlLENBQUMsQ0FBQztJQUM5QyxJQUFBLGdCQUFHLEVBQUMsMEJBQWEsQ0FBQyxLQUFLLEVBQUUsaUJBQWlCLElBQUksRUFBRSxDQUFDLENBQUM7SUFDbEQsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQWlCLENBQUM7QUFDMUUsQ0FBQztBQVJELHdDQVFDIn0=