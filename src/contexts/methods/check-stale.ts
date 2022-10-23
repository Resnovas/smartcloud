/*
 * Project: @resnovas/smartcloud
 * File: check-stale.ts
 * Path: \src\contexts\methods\check-stale.ts
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

/* eslint-disable complexity */

import type {IssueConfig, Issues, Project, ProjectConfig, PullRequestConfig, PullRequests, Schedule} from '..';
import {log, LoggingLevels} from '../../logging';
import type {IssueContext, PrContext, ProjectContext, ScheduleContext, SharedConditions} from '../../conditions';
import {evaluator} from '../../evaluator';
import type {SharedConfig} from '../../types';

/**
 * The stale configuration
 */
export type Stale = {
	/**
	 * The label to use for stale issues
	 */
	staleLabel: string;
	/**
	 * The stale configuration to use
	 */
	stale?: StaleConfig;
	/**
	 * The abanonded configuration to use
	 */
	abandoned?: AbanondedConfig;
	/**
	 * The conditions to use when checking stale
	 */
	condition?: SharedConditions[];
};

/**
 * The stale configuration
 */
export type StaleConfig = {
	/**
	 * The days to consider stale
	 */
	days: number;
	/**
	 * The comment to append to the stale issue
	 */
	comment?: string;
	/**
	 * The comment to switch when resolved
	 */
	resolve?: string;
	/**
	 * The comment to append to the header
	 */
	commentHeader?: string;
	/**
	 * The comment to append to the footer
	 */
	commentFooter?: string;
} & SharedConditions;

/**
 * The abanonded configuration
 */
export type AbanondedConfig = {
	/**
	 * Should the abanonded issue be closed
	 */
	close?: boolean;
	/**
	 * Should the abanonded issue be locked
	 */
	lock?: boolean;
	/**
	 * The label to use for abanonded issues
	 */
	label: string;
} & StaleConfig;

export async function checkStale(
	this: Issues | PullRequests | Project | Schedule,
	context: IssueContext | ScheduleContext | PrContext | ProjectContext = this.context,
	configlocal: SharedConfig | IssueConfig | PullRequestConfig | ProjectConfig = this.config,
) {
	const config = configlocal.stale;
	if (!config) {
		throw new Error('Stale is not enabled');
	}

	if (!context.props) {
		throw new Error('Context Props must exist');
	}

	const staleLabel = this.runnerConfigs.labels?.[config.staleLabel];
	if (!staleLabel) {
		throw new Error('Stale Label must exist');
	}

	const suffix
		= '\r\n\r\n----------\r\n\r\nSimply comment, assign or modify this issue to remove the stale status \r\n\r\n';

	if (config.stale && 'number' in context.props) {
		log(
			LoggingLevels.debug,
			// @ts-expect-error known issue
			`Checking stale status for ${context.props.type} ${context.props.number} - ${String(context.props.title)}`,
		);
		if (
			!config.stale.condition?.find(condition => condition.type === 'isStale')
		) {
			if (config.stale.condition) {
				config.stale.condition.push({
					type: 'isStale',
					condition: config.stale.days,
				});
			} else {
				config.stale.condition = [
					{type: 'isStale', condition: config.stale.days},
				];
			}

			if (config.stale.requires) {
				config.stale.requires++;
			} else {
				config.stale.requires = 1;
			}
		}

		// Check to see if the issue is stale using the evaluation function
		const stale = await evaluator.call(this, config.stale, context.props);
		log(
			LoggingLevels.notice,
			// @ts-expect-error known issue
			`Stale status for ${String(context.props.title)}: ${String(stale)}`,
		);

		// If stale run the rest of the actions
		if (
			(stale)
			&& this.config.labels
			&& !this.config.labels[staleLabel]
		) {
			// Apply the stale label
			this.config.labels[staleLabel] = {
				condition: config.stale.condition,
				requires: 1,
			};
		}

		// Create the stale comment
		const isstale = stale;
		if (!this.dryRun) {
			await this.createComment.bind(this)('stale', isstale, {
				body:
					(isstale ? String(config.stale.comment) : String(config.stale.resolve))
					+ '\r\n\r\n'
					+ suffix.toString()
					+ String(config.stale.commentFooter ?? ''),
			});
		}
	}

	if (config.abandoned && 'number' in context.props) {
		log(
			LoggingLevels.debug,
			// @ts-expect-error known issue
			`Checking abandoned status for ${context.props.type} ${String(context.props.number)} - ${String(context.props.title)}`,
		);
		if (
			!config.abandoned.condition?.find(
				condition => condition.type === 'isAbandoned',
			)
		) {
			if (config.abandoned.condition) {
				config.abandoned.condition.push({
					type: 'isAbandoned',
					condition: config.abandoned.days,
					label: config.abandoned.label,
				});
			} else {
				config.abandoned.condition = [
					{
						type: 'isAbandoned',
						condition: config.abandoned.days,
						label: config.abandoned.label,
					},
				];
			}

			if (config.abandoned.requires) {
				config.abandoned.requires++;
			} else {
				config.abandoned.requires = 1;
			}
		}

		// Check to see if the issue is abandoned using the evaluation function
		const abandoned = await evaluator.call(
			this,
			config.abandoned,
			context.props,
		);
		log(
			LoggingLevels.notice,
			// @ts-expect-error known issue
			`Abandoned status for ${String(context.props.title)}: ${String(abandoned)}`,
		);

		const abandonedLabel = this.runnerConfigs.labels?.[config.abandoned.label];
		if (!abandonedLabel) {
			throw new Error('Stale Label must exist');
		}

		if (
			(abandoned)
			&& abandonedLabel
			&& this.config.labels
			&& !this.config.labels[abandonedLabel]
		) {
			// Apply the stale label
			this.config.labels[abandonedLabel] = {
				condition: config.abandoned.condition,
				requires: 1,
			};
		}

		// Create the abandoned comment
		const isAbandoned = abandoned;
		if (!this.dryRun) {
			await this.createComment.bind(this)('stale', isAbandoned, {
				body:
					String((isAbandoned ? config.abandoned.comment : config.abandoned.resolve))
					+ '\r\n\r\n'
					+ String(suffix)
					+ String(config.abandoned.commentFooter ?? ''),
			});
		}
	}
}
