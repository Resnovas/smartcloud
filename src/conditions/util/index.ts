/**
 * Project: @resnovas/smartcloud
 * File: index.ts
 * Path: \src\conditions\util\index.ts
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

import type {ConditionAnd} from './and';
import and from './and';
import type {ConditionCreatorMatches} from './creator-matches';
import creatorMatches from './creator-matches';
import type {ConditionDescriptionMatches} from './description-matches';
import descriptionMatches from './description-matches';
import type {ConditionHasLabel} from './has-label';
import hasLabel from './has-label';
import type {ConditionIsAbandoned} from './is-abandoned';
import isAbandoned from './is-abandoned';
import type {ConditionIsOpen} from './is-open';
import isOpen from './is-open';
import type {ConditionIsStale} from './is-stale';
import isStale from './is-stale';
import type {ConditionNot} from './not';
import not from './not';
import type {ConditionOnlyOne} from './only';
import only from './only';
import type {ConditionOr} from './or';
import or from './or';
import type {ConditionTitleMatches} from './title-matches';
import titleMatches from './title-matches';

export type Condition =
	| ConditionCreatorMatches
	| ConditionDescriptionMatches
	| ConditionIsOpen
	| ConditionTitleMatches
	| ConditionHasLabel
	| ConditionIsStale
	| ConditionIsAbandoned
	| ConditionOr
	| ConditionAnd
	| ConditionNot
	| ConditionOnlyOne;

/**
 * The utility condition handler.
 */
export const handlers = [
	creatorMatches,
	descriptionMatches,
	isOpen,
	isStale,
	isAbandoned,
	hasLabel,
	titleMatches,
	and,
	or,
	not,
	only,
];
