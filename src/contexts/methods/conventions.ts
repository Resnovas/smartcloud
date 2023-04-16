/*
 * Project: @resnovas/smartcloud
 * File: conventions.ts
 * Path: \src\contexts\methods\conventions.ts
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

/* eslint-disable no-await-in-loop */
import * as core from '@actions/core';
import {gitmojis} from 'gitmojis';
import {log, LoggingLevels} from '../../logging.js';
import type {Condition, SharedConventionConditions, UtilThis} from '../../conditions/index.js';
import {evaluator} from '../../evaluator.js';
import {semantic} from '../../utils/helper/semantic.js';

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

export async function enforce(this: UtilThis) {
	if (
		!this.config.enforceConventions
		|| !this.config.enforceConventions.condition
	) {
		throw new Error('No enforceable conventions');
	}

	let required = 0;
	let successful = 0;
	const failedMessages: string[] = [];
	// This.config.enforceConventions.conventions.forEach(async (convention) => {
	for (const convention of this.config.enforceConventions.condition) {
		if (!convention.condition) {
			return;
		}

		console.log(gitmojis);
		required++;
		if (convention.condition === 'semanticTitle') {
			const {conditions, requires} = semanticTitle.bind(this)(convention);
			convention.condition = conditions;
			convention.requires = requires;
		}

		if (convention.condition === 'gitmojis') {
			const {conditions, requires} = gitmoji.bind(this)(convention);
			convention.condition = conditions;
			convention.requires = requires;
		}

		if (convention.condition === 'semanticEmoji') {
			const {conditions, requires} = semanticEmoji.bind(this)(convention);
			convention.condition = conditions;
			convention.requires = requires;
		}

		const success = await evaluator.bind(this)(convention, this.context.props);
		if (success) {
			successful++;
		} else {
			failedMessages.push(convention.failedComment);
			log(LoggingLevels.info, convention.failedComment);
		}
	}

	if (required > successful) {
		for (const fail of failedMessages) {
			core.setFailed(fail);
		}

		const suffix = `\r\n\r\n----------\r\n\r\nThis message will be automatically updated when you make this change\r\n\r\n${this.config.enforceConventions.commentFooter ?? ''}`;
		const body: string
			= `${this.config.enforceConventions.commentHeader ?? ''}\r\n\r\n`
			+ String(failedMessages?.join('\r\n\r\n'))
			+ suffix;
		await this.createComment.bind(this)('Conventions', false, {body});
		return false;
	}

	log(
		LoggingLevels.info,
		'All conventions successfully enforced. Moving to next step',
	);
	await this.createComment.bind(this)('Conventions', true, {
		body: 'All conventions successfully enforced.',
	});
	return true;
}

function semanticTitle(this: UtilThis, convention: SharedConventionsConfig) {
	let requires = 1;
	const conditions: Condition[] = [];
	for (const condition of semantic) {
		conditions.push({
			type: 'titleMatches',
			condition: `/^${condition}(\\(.*\\))?:/i`,
		});
	}

	if (convention.contexts) {
		requires = 2;
		for (const condition of convention.contexts) {
			conditions.push({
				type: 'titleMatches',
				condition: `/\\(.*${condition}.*\\):/i`,
			});
		}
	}

	convention.failedComment
		= `Semantic Conditions failed - Please title your ${this.curContext.type === 'pr' ? 'pull request' : 'issue'
		} using one of the valid options:\r\n\r\n Types: `
		+ semantic.join(',\r\n')
		+ (convention.contexts
			? `\r\n\r\n Contexts: ${convention.contexts.join(',\r\n')}`
			: '')
			+ '\r\n\r\nFor more information on Semantic Commit Messages, please see https://www.conventionalcommits.org/en/v1.0.0/';
	return {conditions, requires};
}

function gitmoji(this: UtilThis, convention: SharedConventionsConfig) {
	let requires = 1;
	const conditions: Condition[] = [];
	const failConventionComment: string[] = [];
	for (const condition of gitmojis) {
		conditions.push({
			type: 'titleMatches',
			condition: `/^${condition.emoji as string}(\\(.*\\))?:/i`,
		}, {
			type: 'titleMatches',
			condition: `/^${condition.code as string}(\\(.*\\))?:/i`,
		}, {
			type: 'titleMatches',
			condition: `/^${condition.entity as string}(\\(.*\\))?:/i`,
		});
		if (condition.semver) {
			failConventionComment.push(`${condition.emoji as string} || ${condition.code as string} === ${condition.description as string}`);
		}
	}

	if (convention.contexts) {
		requires = 2;
		for (const condition of convention.contexts) {
			conditions.push({
				type: 'titleMatches',
				condition: `/\\(.*${condition}.*\\):/i`,
			});
		}
	}

	convention.failedComment
		= `Gitmoji Conditions failed - Please title your ${this.curContext.type === 'pr' ? 'pull request' : 'issue'
		} using one of the valid options:\r\n\r\n Types: `
		+ failConventionComment.join(',\r\n')
		+ (convention.contexts
			? `\r\n\r\n Contexts: ${convention.contexts.join(',\r\n')}`
			: '')
		+ '\r\n\r\nFor more information on gitmoji, please visit https://gitmoji.dev/';
	return {conditions, requires};
}

function semanticEmoji(this: UtilThis, convention: SharedConventionsConfig) {
	let requires = 2;
	const conditions: Condition[] = [];
	const failConventionComment: string[] = [];
	for (const condition of gitmojis) {
		conditions.push({
			type: 'titleMatches',
			condition: `/^${condition.emoji as string}.*(\\(.*\\))?:/i`,
		}, {
			type: 'titleMatches',
			condition: `/^${condition.code as string}.*(\\(.*\\))?:/i`,
		}, {
			type: 'titleMatches',
			condition: `/^${condition.entity as string}.*(\\(.*\\))?:/i`,
		});
		if (condition.semver) {
			failConventionComment.push(`${condition.emoji as string} || ${condition.code as string} === ${condition.description as string}`);
		}
	}

	if (convention.contexts) {
		requires = 3;
		for (const condition of convention.contexts) {
			conditions.push({
				type: 'titleMatches',
				condition: `/\\(.*${condition}.*\\):/i`,
			});
		}
	}

	convention.failedComment
		= `SemanticEmoji Conditions failed - Please title your ${this.curContext.type === 'pr' ? 'pull request' : 'issue'
		} using a combination of the valid options:`
		+ '\r\nExample: ":bug: fix(context): Fixing a bug in context"'
		+ '\r\n\r\nGitmoji Options: '
		+ failConventionComment.join(',\r\n')
		+ '\r\n\r\nSemantic Options: '
		+ semantic.join(',\r\n')
		+ (convention.contexts
			? `\r\n\r\n Contexts: ${convention.contexts.join(',\r\n')}`
			: '')
		+ '\r\n\r\nFor more information on Semantic Commit Messages, please see https://www.conventionalcommits.org/en/v1.0.0/'
		+ '\r\nFor more information on gitmoji, please visit https://gitmoji.dev/';
	return {conditions, requires};
}
