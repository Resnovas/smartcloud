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

/* eslint-disable @typescript-eslint/naming-convention */

import type {Utils} from '../index.js';

export const column = {
	async list(this: Utils, project_id: number) {
		const result
			= await this.client.rest.projects.listColumns({
				project_id,
			});
		return result.data;
	},
	async get(this: Utils, column_id: number) {
		const result
			= await this.client.rest.projects.getColumn({
				column_id,
			});
		return result.data;
	},
	async listCards(this: Utils, column_id: number) {
		const result
			= await this.client.rest.projects.listCards({
				column_id,
			});
		return result.data;
	},
};
export const card = {
	async get(this: Utils, card_id: number) {
		const result
			= await this.client.rest.projects.getCard({
				card_id,
			});
		return result.data;
	},
	async create(
		this: Utils,
		content_id: number,
		column_id: number,
		content_type?: 'Issue' | 'PullRequest',
	) {
		const result = await this.client.rest.projects.createCard({
			content_id,
			column_id,
			content_type,
		});
		return result.data;
	},
	async move(this: Utils, card_id: number, column_id: number) {
		const result = this.client.rest.projects.moveCard({
			card_id,
			column_id,
			position: 'top',
		});
		return result;
	},
};

export const projects = {
	async get(this: Utils, project_id: number) {
		const result
			= await this.client.rest.projects.get({
				project_id,
			});
		return result.data;
	},
	async org(this: Utils, org: string) {
		const result
			= await this.client.rest.projects.listForOrg({
				org,
			});
		return result.data;
	},
	async user(this: Utils, username: string) {
		const result
			= await this.client.rest.projects.listForUser({
				username,
			});
		return result.data;
	},
	async repo(this: Utils, owner: string, repository: string) {
		const result
			= await this.client.rest.projects.listForRepo({
				owner,
				repo: repository,
			});
		return result.data;
	},
};
