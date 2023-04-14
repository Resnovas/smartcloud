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
const tslib_1 = require("tslib");
function add(IDNumber, label) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield this.client.rest.issues.addLabels(Object.assign(Object.assign({}, this.repo), { issue_number: IDNumber, labels: [label] }));
    });
}
exports.add = add;
function create(label, ref) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const color = yield this.parsingData.formatColor(label.color);
        yield this.client.rest.issues.createLabel(Object.assign(Object.assign(Object.assign(Object.assign({}, this.repo), { ref: (_a = ref !== null && ref !== void 0 ? ref : this.ref) !== null && _a !== void 0 ? _a : 'master' }), label), { color }));
    });
}
exports.create = create;
function del(name, ref) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield this.client.rest.issues.deleteLabel(Object.assign(Object.assign({}, this.repo), { ref: (_a = ref !== null && ref !== void 0 ? ref : this.ref) !== null && _a !== void 0 ? _a : 'master', name }));
    });
}
exports.del = del;
function get(ref) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const labels = yield this.client.paginate(this.client.rest.issues.listLabelsForRepo.endpoint(Object.assign(Object.assign({}, this.repo), { ref: (_a = ref !== null && ref !== void 0 ? ref : this.ref) !== null && _a !== void 0 ? _a : 'master' })));
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
    });
}
exports.get = get;
function remove(IDNumber, label, ref) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield this.client.rest.issues.removeLabel(Object.assign(Object.assign({}, this.repo), { ref: (_a = ref !== null && ref !== void 0 ? ref : this.ref) !== null && _a !== void 0 ? _a : 'master', issue_number: IDNumber, name: label }));
    });
}
exports.remove = remove;
function update(current_name, label, ref) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const color = yield this.parsingData.formatColor(label.color);
        yield this.client.rest.issues.updateLabel(Object.assign(Object.assign({}, this.repo), { ref: (_a = ref !== null && ref !== void 0 ? ref : this.ref) !== null && _a !== void 0 ? _a : 'master', current_name, name: label.name, description: label.description, color }));
    });
}
exports.update = update;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFiZWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWxzL2FwaS9sYWJlbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNDRzs7OztBQU9ILFNBQXNCLEdBQUcsQ0FBYyxRQUFnQixFQUFFLEtBQWE7O1FBQ3JFLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsaUNBQ25DLElBQUksQ0FBQyxJQUFJLEtBQ1osWUFBWSxFQUFFLFFBQVEsRUFDdEIsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQ2QsQ0FBQztJQUNKLENBQUM7Q0FBQTtBQU5ELGtCQU1DO0FBRUQsU0FBc0IsTUFBTSxDQUFjLEtBQVksRUFBRSxHQUFZOzs7UUFDbkUsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDOUQsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyw2REFDckMsSUFBSSxDQUFDLElBQUksS0FDWixHQUFHLEVBQUUsTUFBQSxHQUFHLGFBQUgsR0FBRyxjQUFILEdBQUcsR0FBSSxJQUFJLENBQUMsR0FBRyxtQ0FBSSxRQUFRLEtBQzdCLEtBQUssS0FDUixLQUFLLElBQ0osQ0FBQzs7Q0FDSDtBQVJELHdCQVFDO0FBRUQsU0FBc0IsR0FBRyxDQUFjLElBQVksRUFBRSxHQUFZOzs7UUFDaEUsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxpQ0FDckMsSUFBSSxDQUFDLElBQUksS0FDWixHQUFHLEVBQUUsTUFBQSxHQUFHLGFBQUgsR0FBRyxjQUFILEdBQUcsR0FBSSxJQUFJLENBQUMsR0FBRyxtQ0FBSSxRQUFRLEVBQ2hDLElBQUksSUFDSCxDQUFDOztDQUNIO0FBTkQsa0JBTUM7QUFFRCxTQUFzQixHQUFHLENBQWMsR0FBWTs7O1FBQ2xELE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQ3hDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLGlDQUM5QyxJQUFJLENBQUMsSUFBSSxLQUNaLEdBQUcsRUFBRSxNQUFBLEdBQUcsYUFBSCxHQUFHLGNBQUgsR0FBRyxHQUFJLElBQUksQ0FBQyxHQUFHLG1DQUFJLFFBQVEsSUFDL0IsQ0FDUyxDQUFDO1FBRWIsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQVksRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMvQyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7WUFDaEIsV0FBVyxFQUFFLEtBQUssQ0FBQyxXQUFXO1lBQzlCLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSztTQUNsQixDQUFDLENBQUMsQ0FBQztRQUVKLG1EQUFtRDtRQUNuRCxPQUFPLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUEwQixFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQzNELEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDO1lBQ2xDLE9BQU8sR0FBRyxDQUFDO1FBQ1osQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDOztDQUNQO0FBbkJELGtCQW1CQztBQUVELFNBQXNCLE1BQU0sQ0FFM0IsUUFBZ0IsRUFDaEIsS0FBYSxFQUNiLEdBQVk7OztRQUVaLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsaUNBQ3JDLElBQUksQ0FBQyxJQUFJLEtBQ1osR0FBRyxFQUFFLE1BQUEsR0FBRyxhQUFILEdBQUcsY0FBSCxHQUFHLEdBQUksSUFBSSxDQUFDLEdBQUcsbUNBQUksUUFBUSxFQUNoQyxZQUFZLEVBQUUsUUFBUSxFQUN0QixJQUFJLEVBQUUsS0FBSyxJQUNWLENBQUM7O0NBQ0g7QUFaRCx3QkFZQztBQUVELFNBQXNCLE1BQU0sQ0FFM0IsWUFBb0IsRUFDcEIsS0FBWSxFQUNaLEdBQVk7OztRQUVaLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlELE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsaUNBQ3JDLElBQUksQ0FBQyxJQUFJLEtBQ1osR0FBRyxFQUFFLE1BQUEsR0FBRyxhQUFILEdBQUcsY0FBSCxHQUFHLEdBQUksSUFBSSxDQUFDLEdBQUcsbUNBQUksUUFBUSxFQUNoQyxZQUFZLEVBQ1osSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQ2hCLFdBQVcsRUFBRSxLQUFLLENBQUMsV0FBVyxFQUM5QixLQUFLLElBQ0osQ0FBQzs7Q0FDSDtBQWZELHdCQWVDIn0=