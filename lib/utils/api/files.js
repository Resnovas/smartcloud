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
function get(file, ref) {
    var _a, _b, _c;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        /**
         * Checks to see if the settings file is valid
         */
        const gotdata = yield this.client.rest.repos.getContent({
            owner: (_a = this.repo.owner) !== null && _a !== void 0 ? _a : github.context.repo.owner,
            repo: (_b = this.repo.repo) !== null && _b !== void 0 ? _b : github.context.repo.repo,
            ref: (_c = ref !== null && ref !== void 0 ? ref : this.ref) !== null && _c !== void 0 ? _c : 'master',
            path: file,
        });
        // @ts-expect-error data is not defined explititly in the octokit types
        return node_buffer_1.Buffer.from(gotdata.data.content, gotdata.data.encoding).toString();
    });
}
exports.get = get;
function list(IDNumber, ref) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const files = yield this.client.rest.pulls
            .listFiles(Object.assign(Object.assign({}, this.repo), { pull_number: IDNumber, per_page: 100, ref: (_a = ref !== null && ref !== void 0 ? ref : this.ref) !== null && _a !== void 0 ? _a : 'master' }))
            .catch(error => {
            console.log(error);
            throw new Error(error);
        });
        return files.data.map(file => file.filename);
    });
}
exports.list = list;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbHMvYXBpL2ZpbGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQ0c7QUFDSCx5REFBeUQ7QUFDekQsNkNBQW1DO0FBQ25DLGdFQUEwQztBQUcxQyxTQUFzQixHQUFHLENBRXhCLElBQVksRUFDWixHQUFZOzs7UUFFWjs7V0FFRztRQUNILE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQztZQUN2RCxLQUFLLEVBQUUsTUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssbUNBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSztZQUNuRCxJQUFJLEVBQUUsTUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksbUNBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSTtZQUNoRCxHQUFHLEVBQUUsTUFBQSxHQUFHLGFBQUgsR0FBRyxjQUFILEdBQUcsR0FBSSxJQUFJLENBQUMsR0FBRyxtQ0FBSSxRQUFRO1lBQ2hDLElBQUksRUFBRSxJQUFJO1NBQ1YsQ0FBQyxDQUFDO1FBRUgsdUVBQXVFO1FBQ3ZFLE9BQU8sb0JBQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQzs7Q0FDM0U7QUFqQkQsa0JBaUJDO0FBRUQsU0FBc0IsSUFBSSxDQUFjLFFBQWdCLEVBQUUsR0FBWTs7O1FBQ3JFLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSzthQUN4QyxTQUFTLGlDQUNOLElBQUksQ0FBQyxJQUFJLEtBQ1osV0FBVyxFQUFFLFFBQVEsRUFDckIsUUFBUSxFQUFFLEdBQUcsRUFDYixHQUFHLEVBQUUsTUFBQSxHQUFHLGFBQUgsR0FBRyxjQUFILEdBQUcsR0FBSSxJQUFJLENBQUMsR0FBRyxtQ0FBSSxRQUFRLElBQy9CO2FBQ0QsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNuQixNQUFNLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hCLENBQUMsQ0FBQyxDQUFDO1FBQ0osT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzs7Q0FDN0M7QUFiRCxvQkFhQyJ9