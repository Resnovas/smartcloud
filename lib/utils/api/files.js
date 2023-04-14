"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = exports.get = void 0;
const tslib_1 = require("tslib");
/*
 * Project: @resnovas/smartcloud
 * File: files.ts
 * Path: \src\utils\api\files.ts
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
/* eslint-disable @typescript-eslint/naming-convention */
const node_buffer_1 = require("node:buffer");
const github = tslib_1.__importStar(require("@actions/github"));
async function get(file, ref) {
    /**
     * Checks to see if the settings file is valid
     */
    const gotdata = await this.client.rest.repos.getContent({
        owner: this.repo.owner ?? github.context.repo.owner,
        repo: this.repo.repo ?? github.context.repo.repo,
        ref: ref ?? this.ref ?? 'master',
        path: file,
    });
    // @ts-expect-error data is not defined explititly in the octokit types
    return node_buffer_1.Buffer.from(gotdata.data.content, gotdata.data.encoding).toString();
}
exports.get = get;
async function list(IDNumber, ref) {
    const files = await this.client.rest.pulls
        .listFiles({
        ...this.repo,
        pull_number: IDNumber,
        per_page: 100,
        ref: ref ?? this.ref ?? 'master',
    })
        .catch(error => {
        console.log(error);
        throw new Error(error);
    });
    return files.data.map(file => file.filename);
}
exports.list = list;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbHMvYXBpL2ZpbGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQ0c7QUFDSCx5REFBeUQ7QUFDekQsNkNBQW1DO0FBQ25DLGdFQUEwQztBQUduQyxLQUFLLFVBQVUsR0FBRyxDQUV4QixJQUFZLEVBQ1osR0FBWTtJQUVaOztPQUVHO0lBQ0gsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDO1FBQ3ZELEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLO1FBQ25ELElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJO1FBQ2hELEdBQUcsRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxRQUFRO1FBQ2hDLElBQUksRUFBRSxJQUFJO0tBQ1YsQ0FBQyxDQUFDO0lBRUgsdUVBQXVFO0lBQ3ZFLE9BQU8sb0JBQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUM1RSxDQUFDO0FBakJELGtCQWlCQztBQUVNLEtBQUssVUFBVSxJQUFJLENBQWMsUUFBZ0IsRUFBRSxHQUFZO0lBQ3JFLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSztTQUN4QyxTQUFTLENBQUM7UUFDVixHQUFHLElBQUksQ0FBQyxJQUFJO1FBQ1osV0FBVyxFQUFFLFFBQVE7UUFDckIsUUFBUSxFQUFFLEdBQUc7UUFDYixHQUFHLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUTtLQUNoQyxDQUFDO1NBQ0QsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQixNQUFNLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3hCLENBQUMsQ0FBQyxDQUFDO0lBQ0osT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM5QyxDQUFDO0FBYkQsb0JBYUMifQ==