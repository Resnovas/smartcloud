/**
 * Project: @resnovas/smartcloud
 * File: issues.ts
 * Path: \src\utils\api\issues.ts
 * Created Date: Tuesday, September 6th 2022
 * Author: Jonathan Stevens
 * -----
 * Last Modified: Sun Sep 25 2022
 * Modified By: Jonathan Stevens
 * Current Version: 1.0.0-beta.0
 * -----
 * Copyright (c) 2022 Resnovas - All Rights Reserved
 * -----
 * LICENSE: GNU General Public License v3.0 or later (GPL-3.0+)
 *
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
 * along with this program. If not, please write to: jonathan@resnovas.com ,
 * or see https://www.gnu.org/licenses/gpl-3.0-standalone.html
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE - PLEASE SEE THE LICENSE FILE FOR DETAILS
 * -----
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */

/* eslint-disable @typescript-eslint/naming-convention */

import type {Utils} from '..';

// eslint-disable-next-line max-params
export async function create(
	this: Utils,
	title: string,
	body: string,
	labels: string[],
	assignees: string[],
	milestone: string,
	ref?: string,
) {
	const result
			= await this.client.rest.issues.create({
				...this.repo,
				ref: ref ?? this.ref ?? 'master',
				title,
				body,
				milestone,
				labels,
				assignees,
			});
	return result.data;
}

export async function get(this: Utils, IDNumber: number, ref?: string) {
	const result
		= await this.client.rest.issues.get({
			...this.repo,
			ref: ref ?? this.ref ?? 'master',
			issue_number: IDNumber,
		});
	return result.data;
}

export async function list(
	this: Utils,
	{
		state,
		sort,
		direction,
		page,
		ref,
	}: {
		state?: 'open' | 'closed' | 'all';
		sort?: 'created' | 'updated' | 'comments';
		direction?: 'asc' | 'desc';
		page?: number;
		ref?: string;
	},
) {
	const result
		= await this.client.rest.issues.listForRepo({
			...this.repo,
			ref: ref ?? this.ref ?? 'master',
			state,
			sort,
			direction,
			page,
			per_page: 100,
		});
	return result.data;
}

export const comments = {
	async list(this: Utils, IDNumber: number, ref?: string) {
		const result
			= await this.client.rest.issues.listComments({
				...this.repo,
				ref: ref ?? this.ref ?? 'master',
				issue_number: IDNumber,
			});
		return result.data;
	},
	async get(this: Utils, comment_id: number, ref?: string) {
		const result
			= await this.client.rest.issues.getComment({
				...this.repo,
				ref: ref ?? this.ref ?? 'master',
				comment_id,
			});
		return result.data;
	},
	async create(this: Utils, IDNumber: number, body: string, ref?: string) {
		const result
				= await this.client.rest.issues.createComment({
					...this.repo,
					ref: ref ?? this.ref ?? 'master',
					issue_number: IDNumber,
					body,
				});
		return result.data;
	},
	async update(this: Utils, comment_id: number, body: string, ref?: string) {
		const result
				= await this.client.rest.issues.updateComment({
					...this.repo,
					ref: ref ?? this.ref ?? 'master',
					comment_id,
					body,
				});
		return result.data;
	},
	async delete(this: Utils, comment_id: number, ref?: string) {
		const result
				= await this.client.rest.issues.deleteComment({
					...this.repo,
					ref: ref ?? this.ref ?? 'master',
					comment_id,
				});
		return result.data;
	},
};
