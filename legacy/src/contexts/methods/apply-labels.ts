/*
 * Project: @resnovas/smartcloud
 * File: apply-labels.ts
 * Path: \src\contexts\methods\apply-labels.ts
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

import {log, LoggingLevels} from '../../logging.js';
import {evaluator} from '../../evaluator.js';
import type {UtilThis} from '../../conditions/index.js';

export async function applyLabels(this: UtilThis) {
	if (!this.config?.labels || !this.runnerConfigs.labels) {
		log(LoggingLevels.error, 'Config is required to add labels');
		throw new Error('Config is required to add labels');
	}

	for (const [labelId] of Object.entries(
		this.config.labels,
	)) {
		if (!this.context.props) {
			throw new Error('Props are required');
		}

		log(LoggingLevels.debug, `Label: ${labelId}`);

		const conditionsConfig = this.config.labels[labelId];

		if (!conditionsConfig) {
			throw new Error('Configuration for label is required');
		}

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
			const labelName = this.runnerConfigs.labels[labelId]!;
			if (!labelName) {
				throw new Error(log(
					LoggingLevels.error,
					`Can't find configuration for "${labelId}" within labels. Check spelling and that it exists`,
				));
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

			if ('number' in this.context.props) {
				const number = this.context.props.number;

				await this.util.labels
					.addRemove(labelName, number, hasLabel, shouldHaveLabel)
					.catch(async error => {
						throw new Error(log(
							LoggingLevels.error,
							'Error thrown while running addRemoveLabel: ' + String(error),
						));
					});
			}
		}).catch((error: unknown) => {
			log(LoggingLevels.warn, String(error));
		});
	}
}
