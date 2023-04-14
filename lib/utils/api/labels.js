"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: labels.ts
 * Path: \src\utils\api\labels.ts
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
exports.update = exports.remove = exports.get = exports.del = exports.create = exports.add = void 0;
async function add(IDNumber, label) {
    await this.client.rest.issues.addLabels({
        ...this.repo,
        issue_number: IDNumber,
        labels: [label],
    });
}
exports.add = add;
async function create(label, ref) {
    const color = await this.parsingData.formatColor(label.color);
    await this.client.rest.issues.createLabel({
        ...this.repo,
        ref: ref ?? this.ref ?? 'master',
        ...label,
        color,
    });
}
exports.create = create;
async function del(name, ref) {
    await this.client.rest.issues.deleteLabel({
        ...this.repo,
        ref: ref ?? this.ref ?? 'master',
        name,
    });
}
exports.del = del;
async function get(ref) {
    const labels = await this.client.paginate(this.client.rest.issues.listLabelsForRepo.endpoint({
        ...this.repo,
        ref: ref ?? this.ref ?? 'master',
    }));
    const labelsMap = labels.map((label) => ({
        name: label.name,
        description: label.description,
        color: label.color,
    }));
    // eslint-disable-next-line unicorn/no-array-reduce
    return labelsMap.reduce((acc, cur) => {
        acc[cur.name.toLowerCase()] = cur;
        return acc;
    }, {});
}
exports.get = get;
async function remove(IDNumber, label, ref) {
    await this.client.rest.issues.removeLabel({
        ...this.repo,
        ref: ref ?? this.ref ?? 'master',
        issue_number: IDNumber,
        name: label,
    });
}
exports.remove = remove;
async function update(current_name, label, ref) {
    const color = await this.parsingData.formatColor(label.color);
    await this.client.rest.issues.updateLabel({
        ...this.repo,
        ref: ref ?? this.ref ?? 'master',
        current_name,
        name: label.name,
        description: label.description,
        color,
    });
}
exports.update = update;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFiZWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWxzL2FwaS9sYWJlbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNDRzs7O0FBT0ksS0FBSyxVQUFVLEdBQUcsQ0FBYyxRQUFnQixFQUFFLEtBQWE7SUFDckUsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQ3ZDLEdBQUcsSUFBSSxDQUFDLElBQUk7UUFDWixZQUFZLEVBQUUsUUFBUTtRQUN0QixNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUM7S0FDZixDQUFDLENBQUM7QUFDSixDQUFDO0FBTkQsa0JBTUM7QUFFTSxLQUFLLFVBQVUsTUFBTSxDQUFjLEtBQVksRUFBRSxHQUFZO0lBQ25FLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzlELE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUN6QyxHQUFHLElBQUksQ0FBQyxJQUFJO1FBQ1osR0FBRyxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxJQUFJLFFBQVE7UUFDaEMsR0FBRyxLQUFLO1FBQ1IsS0FBSztLQUNMLENBQUMsQ0FBQztBQUNKLENBQUM7QUFSRCx3QkFRQztBQUVNLEtBQUssVUFBVSxHQUFHLENBQWMsSUFBWSxFQUFFLEdBQVk7SUFDaEUsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQ3pDLEdBQUcsSUFBSSxDQUFDLElBQUk7UUFDWixHQUFHLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUTtRQUNoQyxJQUFJO0tBQ0osQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQU5ELGtCQU1DO0FBRU0sS0FBSyxVQUFVLEdBQUcsQ0FBYyxHQUFZO0lBQ2xELE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQ3hDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUM7UUFDbEQsR0FBRyxJQUFJLENBQUMsSUFBSTtRQUNaLEdBQUcsRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxRQUFRO0tBQ2hDLENBQUMsQ0FDUyxDQUFDO0lBRWIsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQVksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMvQyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7UUFDaEIsV0FBVyxFQUFFLEtBQUssQ0FBQyxXQUFXO1FBQzlCLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSztLQUNsQixDQUFDLENBQUMsQ0FBQztJQUVKLG1EQUFtRDtJQUNuRCxPQUFPLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUEwQixFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQzNELEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDO1FBQ2xDLE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ1IsQ0FBQztBQW5CRCxrQkFtQkM7QUFFTSxLQUFLLFVBQVUsTUFBTSxDQUUzQixRQUFnQixFQUNoQixLQUFhLEVBQ2IsR0FBWTtJQUVaLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUN6QyxHQUFHLElBQUksQ0FBQyxJQUFJO1FBQ1osR0FBRyxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxJQUFJLFFBQVE7UUFDaEMsWUFBWSxFQUFFLFFBQVE7UUFDdEIsSUFBSSxFQUFFLEtBQUs7S0FDWCxDQUFDLENBQUM7QUFDSixDQUFDO0FBWkQsd0JBWUM7QUFFTSxLQUFLLFVBQVUsTUFBTSxDQUUzQixZQUFvQixFQUNwQixLQUFZLEVBQ1osR0FBWTtJQUVaLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzlELE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUN6QyxHQUFHLElBQUksQ0FBQyxJQUFJO1FBQ1osR0FBRyxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxJQUFJLFFBQVE7UUFDaEMsWUFBWTtRQUNaLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTtRQUNoQixXQUFXLEVBQUUsS0FBSyxDQUFDLFdBQVc7UUFDOUIsS0FBSztLQUNMLENBQUMsQ0FBQztBQUNKLENBQUM7QUFmRCx3QkFlQyJ9