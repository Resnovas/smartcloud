/**
 * Project: @resnovas/smartcloud
 * File: files.ts
 * Path: \src\utils\api\files.ts
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
/* eslint-disable n/prefer-global/buffer */
import * as github from '@actions/github';
import type {Utils} from '..';

export async function get(
	this: Utils,
	file: string,
	ref?: string,
): Promise<string> {
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
	return Buffer.from(gotdata.data.content, gotdata.data.encoding).toString();
}

export async function list(this: Utils, IDNumber: number, ref?: string) {
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
