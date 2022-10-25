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
import path from 'node:path';
import { log, LoggingLevels } from '../logging.js';
/**
 * Gets the version information
 * @author IvanFon, TGTGamer
 * @since 1.0.0
 */
export async function parse(config, ref) {
    let rawVersion;
    if (!config.branch) {
        config.branch = 'master';
    }
    if (config.versioning?.source === 'node') {
        rawVersion = await getNodeVersion
            .call(this, config.branch, ref)
            .catch(async (error) => {
            throw new Error(log(LoggingLevels.error, 'Error thrown while parsing node project: ' + String(error)));
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
export async function getNodeVersion(root, ref) {
    const file = path.join(root, '/package.json');
    log(LoggingLevels.debug, `Getting file: ${file}`);
    return JSON.parse(await this.api.files.get(file, ref)).version;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyc2lvbmluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy92ZXJzaW9uaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNDRztBQUVILE9BQU8sSUFBSSxNQUFNLFdBQVcsQ0FBQztBQUM3QixPQUFPLEVBQUMsR0FBRyxFQUFFLGFBQWEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUtqRDs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLEtBQUssVUFBVSxLQUFLLENBRTFCLE1BQWMsRUFDZCxHQUFZO0lBRVosSUFBSSxVQUFVLENBQUM7SUFDZixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtRQUNuQixNQUFNLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQztLQUN6QjtJQUVELElBQUksTUFBTSxDQUFDLFVBQVUsRUFBRSxNQUFNLEtBQUssTUFBTSxFQUFFO1FBQ3pDLFVBQVUsR0FBRyxNQUFNLGNBQWM7YUFDL0IsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQzthQUM5QixLQUFLLENBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxFQUFFO1lBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxDQUNsQixhQUFhLENBQUMsS0FBSyxFQUNuQiwyQ0FBMkMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQzNELENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0tBQ0o7U0FBTSxJQUFJLE1BQU0sQ0FBQyxVQUFVLEVBQUUsTUFBTSxLQUFLLFlBQVksRUFBRTtRQUN0RCw4QkFBOEI7S0FDOUI7U0FBTSxJQUFJLE1BQU0sQ0FBQyxVQUFVLEVBQUUsTUFBTSxFQUFFO1FBQ3JDLFVBQVUsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQztLQUN0QztTQUFNO1FBQ04sTUFBTSxJQUFJLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO0tBQ25EO0lBRUQsSUFBSSxDQUFDLFVBQVUsRUFBRTtRQUNoQixVQUFVLEdBQUcsT0FBTyxDQUFDO0tBQ3JCO0lBRUQsSUFBSSxNQUFNLENBQUMsVUFBVSxFQUFFLElBQUksS0FBSyxRQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRTtRQUNwRSxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbkMsTUFBTSxLQUFLLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNoRSxNQUFNLElBQUksS0FBSyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7U0FDbEQ7UUFFRCxNQUFNLFVBQVUsR0FBd0I7WUFDdkMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEIsS0FBSyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEIsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDcEIsVUFBVSxFQUFFLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdkQsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7U0FDOUMsQ0FBQztRQUNGLE9BQU8sRUFBQyxRQUFRLEVBQUUsVUFBVSxFQUFDLENBQUM7S0FDOUI7SUFFRCxPQUFPLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBQyxDQUFDO0FBQzNCLENBQUM7QUFFRCxNQUFNLENBQUMsS0FBSyxVQUFVLGNBQWMsQ0FFbkMsSUFBWSxFQUNaLEdBQVk7SUFFWixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxlQUFlLENBQUMsQ0FBQztJQUM5QyxHQUFHLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxpQkFBaUIsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUNsRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBaUIsQ0FBQztBQUMxRSxDQUFDIn0=