/**
 * Project: @resnovas/smartcloud
 * File: createBranch.ts
 * Path: \src\contexts\methods\createBranch.ts
 * Created Date: Monday, September 5th 2022
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

import type {Issues} from '../issues';

/**
 * Create branch on project configuration
 */

export type ProjectCreateBranch = {
	/**
	 * Project to use
	 */
	onProject?: string;
	/**
	 * Column to use
	 */
	onColumn?: string;
} & CreateBranch;

/**
 * Create branch configuration
 */
export type CreateBranch = {
	/**
	 * The branch prefix
	 */
	branchPrefix?: string;
	/**
	 * The branch suffix
	 */
	branchSuffix?: string;
	/**
	 * The branch name type
	 */
	branchName: 'title' | 'short' | 'number';
};

export function createBranch(this: Issues) {}
