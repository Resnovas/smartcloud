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
exports.column = {
    async list(project_id) {
        const result = await this.client.rest.projects.listColumns({
            project_id,
        });
        return result.data;
    },
    async get(column_id) {
        const result = await this.client.rest.projects.getColumn({
            column_id,
        });
        return result.data;
    },
    async listCards(column_id) {
        const result = await this.client.rest.projects.listCards({
            column_id,
        });
        return result.data;
    },
};
exports.card = {
    async get(card_id) {
        const result = await this.client.rest.projects.getCard({
            card_id,
        });
        return result.data;
    },
    async create(content_id, column_id, content_type) {
        const result = await this.client.rest.projects.createCard({
            content_id,
            column_id,
            content_type,
        });
        return result.data;
    },
    async move(card_id, column_id) {
        const result = this.client.rest.projects.moveCard({
            card_id,
            column_id,
            position: 'top',
        });
        return result;
    },
};
exports.projects = {
    async get(project_id) {
        const result = await this.client.rest.projects.get({
            project_id,
        });
        return result.data;
    },
    async org(org) {
        const result = await this.client.rest.projects.listForOrg({
            org,
        });
        return result.data;
    },
    async user(username) {
        const result = await this.client.rest.projects.listForUser({
            username,
        });
        return result.data;
    },
    async repo(owner, repository) {
        const result = await this.client.rest.projects.listForRepo({
            owner,
            repo: repository,
        });
        return result.data;
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvamVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9hcGkvcHJvamVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHOzs7QUFNVSxRQUFBLE1BQU0sR0FBRztJQUNyQixLQUFLLENBQUMsSUFBSSxDQUFjLFVBQWtCO1FBQ3pDLE1BQU0sTUFBTSxHQUNULE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQztZQUM3QyxVQUFVO1NBQ1YsQ0FBQyxDQUFDO1FBQ0osT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ3BCLENBQUM7SUFDRCxLQUFLLENBQUMsR0FBRyxDQUFjLFNBQWlCO1FBQ3ZDLE1BQU0sTUFBTSxHQUNULE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQztZQUMzQyxTQUFTO1NBQ1QsQ0FBQyxDQUFDO1FBQ0osT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ3BCLENBQUM7SUFDRCxLQUFLLENBQUMsU0FBUyxDQUFjLFNBQWlCO1FBQzdDLE1BQU0sTUFBTSxHQUNULE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQztZQUMzQyxTQUFTO1NBQ1QsQ0FBQyxDQUFDO1FBQ0osT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ3BCLENBQUM7Q0FDRCxDQUFDO0FBQ1csUUFBQSxJQUFJLEdBQUc7SUFDbkIsS0FBSyxDQUFDLEdBQUcsQ0FBYyxPQUFlO1FBQ3JDLE1BQU0sTUFBTSxHQUNULE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQztZQUN6QyxPQUFPO1NBQ1AsQ0FBQyxDQUFDO1FBQ0osT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ3BCLENBQUM7SUFDRCxLQUFLLENBQUMsTUFBTSxDQUVYLFVBQWtCLEVBQ2xCLFNBQWlCLEVBQ2pCLFlBQXNDO1FBRXRDLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQztZQUN6RCxVQUFVO1lBQ1YsU0FBUztZQUNULFlBQVk7U0FDWixDQUFDLENBQUM7UUFDSCxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDcEIsQ0FBQztJQUNELEtBQUssQ0FBQyxJQUFJLENBQWMsT0FBZSxFQUFFLFNBQWlCO1FBQ3pELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7WUFDakQsT0FBTztZQUNQLFNBQVM7WUFDVCxRQUFRLEVBQUUsS0FBSztTQUNmLENBQUMsQ0FBQztRQUNILE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztDQUNELENBQUM7QUFFVyxRQUFBLFFBQVEsR0FBRztJQUN2QixLQUFLLENBQUMsR0FBRyxDQUFjLFVBQWtCO1FBQ3hDLE1BQU0sTUFBTSxHQUNULE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztZQUNyQyxVQUFVO1NBQ1YsQ0FBQyxDQUFDO1FBQ0osT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ3BCLENBQUM7SUFDRCxLQUFLLENBQUMsR0FBRyxDQUFjLEdBQVc7UUFDakMsTUFBTSxNQUFNLEdBQ1QsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDO1lBQzVDLEdBQUc7U0FDSCxDQUFDLENBQUM7UUFDSixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDcEIsQ0FBQztJQUNELEtBQUssQ0FBQyxJQUFJLENBQWMsUUFBZ0I7UUFDdkMsTUFBTSxNQUFNLEdBQ1QsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDO1lBQzdDLFFBQVE7U0FDUixDQUFDLENBQUM7UUFDSixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDcEIsQ0FBQztJQUNELEtBQUssQ0FBQyxJQUFJLENBQWMsS0FBYSxFQUFFLFVBQWtCO1FBQ3hELE1BQU0sTUFBTSxHQUNULE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQztZQUM3QyxLQUFLO1lBQ0wsSUFBSSxFQUFFLFVBQVU7U0FDaEIsQ0FBQyxDQUFDO1FBQ0osT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ3BCLENBQUM7Q0FDRCxDQUFDIn0=