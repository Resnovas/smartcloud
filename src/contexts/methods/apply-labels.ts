/**
 * Project: @resnovas/smartcloud
 * File: applyLabels.ts
 * Path: \src\contexts\methods\applyLabels.ts
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

import {LoggingDataClass, LoggingLevels} from '@resnovas/utilities';
import {log} from '../../logging';
import type {UtilThis} from '../../conditions';
import {evaluator} from '../../evaluator';

export async function applyLabels(this: UtilThis) {
	if (!this.config?.labels || !this.configs.labels) {
		throw new LoggingDataClass(
			LoggingLevels.error,
			'Config is required to add labels',
		);
	}

	for (const [labelId] of Object.entries(
		this.config.labels,
	)) {
		if (!this.context.props) {
			throw new Error('Props are required');
		}

		const conditionsConfig = this.configs.labels[labelId];

		evaluator.call(
			this,
			conditionsConfig,
			this.context.props,
		).then(async shouldHaveLabel => {
			if (!this.context.props) {
				throw new Error('Props are required');
			}

			// Todo: convert to generic
			// @ts-expect-error needs converting
			const labelName = this.configs.labels[labelId]!;
			if (!labelName) {
				throw new LoggingDataClass(
					LoggingLevels.error,
					`Can't find configuration for "${labelId}" within labels. Check spelling and that it exists`,
				);
			}

			const hasLabel = Boolean(
				this.context.props.labels?.[labelName.toLowerCase()],
			);
			if (!shouldHaveLabel && hasLabel && this.context.props.labels) {
				// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
				delete this.context.props.labels[labelName.toLowerCase()];
			}

			if (
				shouldHaveLabel
			&& !hasLabel
			&& this.context.props.labels
			&& this.runners.labels
			) {
				const l = this.runners.labels[labelId];
				if (l) {
					this.context.props.labels[labelName.toLowerCase()] = l;
				}
			}

			await this.util.labels
				.addRemove(labelName, this.context.props.ID, hasLabel, shouldHaveLabel)
				.catch(async error => {
					await log(
						LoggingLevels.error,
						'Error thrown while running addRemoveLabel: ' + String(error),
					);
				});
		}).catch(console.log);
	}
}
