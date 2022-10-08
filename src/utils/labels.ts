/**
 * Project: @resnovas/smartcloud
 * File: labels.ts
 * Path: \src\utils\labels.ts
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

import {LoggingDataClass, LoggingLevels} from '@resnovas/utilities';
import {log} from '../logging';
import type {Labels, Runners} from '../types';
import {formatColor} from './parsing-data';
import type {Utils} from '.';

/**
 * Syncronise labels to repository
 * @author IvanFon, TGTGamer, jbinda
 * @since 1.0.0
 */
export async function sync(this: Utils, config: Runners['labels']) {
	/**
	 * Syncronises the repo labels
	 * !todo Add delete labels
	 * @since 2.0.0
	 */
	if (!config) {
		throw new Error('Cannot syncronise labels without config');
	}

	const curLabels: Labels = await this.api.labels.get();

	await log(LoggingLevels.debug, `curLabels: ${JSON.stringify(curLabels)}`);
	for (const configLabel of Object.values(config)) {
		const label = curLabels[configLabel.name.toLowerCase()];

		/**
		 * Update label
		 * @author IvanFon, TGTGamer, jbinda
		 * @since 1.0.0
		 */
		if (label) {
			if (
				label.name !== configLabel.name
				|| (label.description !== configLabel.description
					&& configLabel.description !== undefined)
				|| label.color !== formatColor(configLabel.color)
			) {
				await log(
					LoggingLevels.info,
					`Recreate ${JSON.stringify(configLabel)} (prev: ${JSON.stringify(
						label,
					)})`,
				);
				await this.api.labels.update(label.name, configLabel).catch(error => {
					await log(
						LoggingLevels.error,
						'Error thrown while updating label: ' + String(error),
					);
				});
			} else {
				await log(
					LoggingLevels.info,
					`No action required to update label: ${label.name}`,
				);
			}

			/**
			 * Create label
			 * @author IvanFon, TGTGamer, jbinda
			 * @since 1.0.0
			 */
		} else {
			await log(LoggingLevels.info, `Create ${JSON.stringify(configLabel)}`);
			await this.api.labels.create(configLabel).catch(error => {
				await log(LoggingLevels.error, 'Error thrown while creating label: ' + String(error));
			});
		}
	}

	if (this.skipDelete) {
		await log(LoggingLevels.warn, 'Skipping deletion of labels');
	} else {
		for (const curLabel of Object.values(curLabels)) {
			const label = config[curLabel.name.toLowerCase()];
			if (!label) {
				await log(LoggingLevels.warn, `Delete ${JSON.stringify(curLabel)}`);
				await this.api.labels.del(curLabel.name).catch(async error => {
					await log(
						LoggingLevels.error,
						'Error thrown while deleting label: ' + String(error),
					);
				});
			}
		}
	}
}

/**
 * Add or Remove Labels
 * @author IvanFon, TGTGamer, jbinda
 * @since 1.0.0
 */
export async function addRemove(
	this: Utils,
	labelName: string,
	IDNumber: number,
	hasLabel: boolean,
	shouldHaveLabel: boolean,
) {
	if (!labelName) {
		throw new LoggingDataClass(
			LoggingLevels.info,
			`Can't run add or remove labels if you don't provide the name of the label you want to apply: ${labelName}`,
		);
	}

	await log(
		LoggingLevels.debug,
		`Current label: ${labelName.toLowerCase()} -- Does issue have label: ${String(hasLabel)} but should it: ${String(shouldHaveLabel)}`,
	);
	if (shouldHaveLabel && !hasLabel) {
		await log(LoggingLevels.info, `Adding label "${labelName}"...`);
		await this.api.labels.add(IDNumber, labelName).catch(async error => {
			await log(LoggingLevels.error, 'Error thrown while adding labels: ' + String(error));
		});
	} else if (!shouldHaveLabel && hasLabel) {
		await log(LoggingLevels.info, `Removing label "${labelName}"...`);
		await this.api.labels.remove(IDNumber, labelName).catch(async error => {
			await log(LoggingLevels.error, 'Error thrown while removing labels: ' + String(error));
		});
	} else {
		await log(
			LoggingLevels.info,
			`No action required for label "${labelName}"${hasLabel ? ' as label is already applied.' : '.'
			}`,
		);
	}
}
