"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: project.ts
 * Path: \src\utils\api\project.ts
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
exports.projects = exports.card = exports.column = void 0;
const tslib_1 = require("tslib");
exports.column = {
    list(project_id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const result = yield this.client.rest.projects.listColumns({
                project_id,
            });
            return result.data;
        });
    },
    get(column_id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const result = yield this.client.rest.projects.getColumn({
                column_id,
            });
            return result.data;
        });
    },
    listCards(column_id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const result = yield this.client.rest.projects.listCards({
                column_id,
            });
            return result.data;
        });
    },
};
exports.card = {
    get(card_id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const result = yield this.client.rest.projects.getCard({
                card_id,
            });
            return result.data;
        });
    },
    create(content_id, column_id, content_type) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const result = yield this.client.rest.projects.createCard({
                content_id,
                column_id,
                content_type,
            });
            return result.data;
        });
    },
    move(card_id, column_id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const result = this.client.rest.projects.moveCard({
                card_id,
                column_id,
                position: 'top',
            });
            return result;
        });
    },
};
exports.projects = {
    get(project_id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const result = yield this.client.rest.projects.get({
                project_id,
            });
            return result.data;
        });
    },
    org(org) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const result = yield this.client.rest.projects.listForOrg({
                org,
            });
            return result.data;
        });
    },
    user(username) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const result = yield this.client.rest.projects.listForUser({
                username,
            });
            return result.data;
        });
    },
    repo(owner, repository) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const result = yield this.client.rest.projects.listForRepo({
                owner,
                repo: repository,
            });
            return result.data;
        });
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvamVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9hcGkvcHJvamVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHOzs7O0FBTVUsUUFBQSxNQUFNLEdBQUc7SUFDZixJQUFJLENBQWMsVUFBa0I7O1lBQ3pDLE1BQU0sTUFBTSxHQUNULE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQztnQkFDN0MsVUFBVTthQUNWLENBQUMsQ0FBQztZQUNKLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQztRQUNwQixDQUFDO0tBQUE7SUFDSyxHQUFHLENBQWMsU0FBaUI7O1lBQ3ZDLE1BQU0sTUFBTSxHQUNULE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQztnQkFDM0MsU0FBUzthQUNULENBQUMsQ0FBQztZQUNKLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQztRQUNwQixDQUFDO0tBQUE7SUFDSyxTQUFTLENBQWMsU0FBaUI7O1lBQzdDLE1BQU0sTUFBTSxHQUNULE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQztnQkFDM0MsU0FBUzthQUNULENBQUMsQ0FBQztZQUNKLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQztRQUNwQixDQUFDO0tBQUE7Q0FDRCxDQUFDO0FBQ1csUUFBQSxJQUFJLEdBQUc7SUFDYixHQUFHLENBQWMsT0FBZTs7WUFDckMsTUFBTSxNQUFNLEdBQ1QsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO2dCQUN6QyxPQUFPO2FBQ1AsQ0FBQyxDQUFDO1lBQ0osT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ3BCLENBQUM7S0FBQTtJQUNLLE1BQU0sQ0FFWCxVQUFrQixFQUNsQixTQUFpQixFQUNqQixZQUFzQzs7WUFFdEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDO2dCQUN6RCxVQUFVO2dCQUNWLFNBQVM7Z0JBQ1QsWUFBWTthQUNaLENBQUMsQ0FBQztZQUNILE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQztRQUNwQixDQUFDO0tBQUE7SUFDSyxJQUFJLENBQWMsT0FBZSxFQUFFLFNBQWlCOztZQUN6RCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO2dCQUNqRCxPQUFPO2dCQUNQLFNBQVM7Z0JBQ1QsUUFBUSxFQUFFLEtBQUs7YUFDZixDQUFDLENBQUM7WUFDSCxPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7S0FBQTtDQUNELENBQUM7QUFFVyxRQUFBLFFBQVEsR0FBRztJQUNqQixHQUFHLENBQWMsVUFBa0I7O1lBQ3hDLE1BQU0sTUFBTSxHQUNULE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztnQkFDckMsVUFBVTthQUNWLENBQUMsQ0FBQztZQUNKLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQztRQUNwQixDQUFDO0tBQUE7SUFDSyxHQUFHLENBQWMsR0FBVzs7WUFDakMsTUFBTSxNQUFNLEdBQ1QsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDO2dCQUM1QyxHQUFHO2FBQ0gsQ0FBQyxDQUFDO1lBQ0osT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ3BCLENBQUM7S0FBQTtJQUNLLElBQUksQ0FBYyxRQUFnQjs7WUFDdkMsTUFBTSxNQUFNLEdBQ1QsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDO2dCQUM3QyxRQUFRO2FBQ1IsQ0FBQyxDQUFDO1lBQ0osT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ3BCLENBQUM7S0FBQTtJQUNLLElBQUksQ0FBYyxLQUFhLEVBQUUsVUFBa0I7O1lBQ3hELE1BQU0sTUFBTSxHQUNULE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQztnQkFDN0MsS0FBSztnQkFDTCxJQUFJLEVBQUUsVUFBVTthQUNoQixDQUFDLENBQUM7WUFDSixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDcEIsQ0FBQztLQUFBO0NBQ0QsQ0FBQyJ9