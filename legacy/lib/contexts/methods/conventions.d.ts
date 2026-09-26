/**
 * Project: @resnovas/smartcloud
 * File: conventions.ts
 * Path: \src\contexts\methods\conventions.ts
 * Created Date: Sunday, April 16th 2023
 * Author: Jonathan Stevens (jonathan@resnovas.com)
 * -----
 * Last Modified: Sun Apr 16 2023
 * Modified By: Jonathan Stevens
 * Current Version: 1.0.0-beta.7
 * -----
 * Copyright (c) 2023 Resnovas - All Rights Reserved
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
import type { SharedConventionConditions, UtilThis } from '../../conditions/index.js';
/**
 * The enforce conventions configuration
 */
export type Column = string | number;
export type EnforceConventions = {
    /**
     * The columns to enforce conventions
     */
    onColumn?: Column[];
    /**
     * The comment to append to the header
     */
    commentHeader?: string;
    /**
     * The comment to append to the footer
     */
    commentFooter?: string;
    /**
     * The column to move if fails
     */
    moveToColumn?: string;
    /**
     * The conventions to enforce
     */
    condition: SharedConventionsConfig[];
};
export type SharedConventionsConfig = {
    /**
     * The failed comment to use
     */
    failedComment: string;
    /**
     * The contexts to use. Use this in combernation with "semanticTitle"
     * @requires conditions: "semanticTitle"
     */
    contexts?: string[];
} & SharedConventionConditions;
export declare function enforce(this: UtilThis): Promise<boolean | undefined>;
