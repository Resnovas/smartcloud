/*
 * Project: @resnovas/smartcloud
 * File: parsing-data.ts
 * Path: \src\utils\parsing-data.ts
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

import type {Label, Labels} from '../types.js';

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
