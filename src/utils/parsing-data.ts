/**
 * Project: @resnovas/smartcloud
 * File: parsingData.ts
 * Path: \src\utils\parsingData.ts
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

import type {Label, Labels} from '../types';

/**
 * Formats the hex color code to ensure no hash (#) is included
 * @author IvanFon, TGTGamer
 * @param {String} color Hex color code
 * @since 1.0.0
 */
export const formatColor = (color: string) => {
	if (color.startsWith('#')) {
		return color.slice(1);
	}

	return color;
};

/**
 * Formats the hex color code to ensure no hash (#) is included
 * @author IvanFon, jbinda
 * @param {String} condition Regex partern to use
 * @since 1.0.0
 */
export const processRegExpcondition = (condition: string) => {
	const matchDelimiters = /^\/(.*)\/(.*)$/.exec(condition);

	const [, source, flags] = matchDelimiters ?? [];

	return new RegExp(source ?? condition, flags);
};

/**
 * Normalizes text toUpperCase
 * @author IvanFon, TGTGamer
 * @since 1.0.0
 */
export const normalize = (text: string) => (text || '').toUpperCase();

/**
 * Parse the labels
 * @author IvanFon, TGTGamer, jbinda
 * @since 1.0.0
 */

// todo : fix this
export const parseLabels = async (labels: any): Promise<Labels | undefined> => {
	if (!Array.isArray(labels)) {
		return;
	}

	// eslint-disable-next-line unicorn/no-array-reduce
	return labels.reduce((acc: Record<string, Label>, cur) => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		acc[cur.name.toLowerCase()] = cur as Label;
		return acc;
	}, {});
};
