/*
 * Project: @resnovas/smartcloud
 * File: index.ts
 * Path: \src\conditions\util\index.ts
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

import type {ConditionAnd} from './and.js';
import and from './and.js';
import type {ConditionCreatorMatches} from './creator-matches.js';
import creatorMatches from './creator-matches.js';
import type {ConditionDescriptionMatches} from './description-matches.js';
import descriptionMatches from './description-matches.js';
import type {ConditionHasLabel} from './has-label.js';
import hasLabel from './has-label.js';
import type {ConditionIsAbandoned} from './is-abandoned.js';
import isAbandoned from './is-abandoned.js';
import type {ConditionIsOpen} from './is-open.js';
import isOpen from './is-open.js';
import type {ConditionIsStale} from './is-stale.js';
import isStale from './is-stale.js';
import type {ConditionNot} from './not.js';
import not from './not.js';
import type {ConditionOnlyOne} from './only.js';
import only from './only.js';
import type {ConditionOr} from './or.js';
import or from './or.js';
import type {ConditionTitleMatches} from './title-matches.js';
import titleMatches from './title-matches.js';

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
