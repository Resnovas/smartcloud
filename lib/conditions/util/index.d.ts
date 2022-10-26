import type { ConditionAnd } from './and.js';
import type { ConditionCreatorMatches } from './creator-matches.js';
import type { ConditionDescriptionMatches } from './description-matches.js';
import type { ConditionHasLabel } from './has-label.js';
import type { ConditionIsAbandoned } from './is-abandoned.js';
import type { ConditionIsOpen } from './is-open.js';
import type { ConditionIsStale } from './is-stale.js';
import type { ConditionNot } from './not.js';
import type { ConditionOnlyOne } from './only.js';
import type { ConditionOr } from './or.js';
import type { ConditionTitleMatches } from './title-matches.js';
export declare type Condition = ConditionCreatorMatches | ConditionDescriptionMatches | ConditionIsOpen | ConditionTitleMatches | ConditionHasLabel | ConditionIsStale | ConditionIsAbandoned | ConditionOr | ConditionAnd | ConditionNot | ConditionOnlyOne;
/**
 * The utility condition handler.
 */
export declare const handlers: (readonly ["$and", (this: import("../index.js").UtilThis, condition: ConditionAnd, context: import("../index.js").UtilProps) => Promise<boolean>] | readonly ["creatorMatches", (this: import("../index.js").UtilThis, pattern: ConditionCreatorMatches, context: import("../index.js").UtilProps) => Promise<boolean>] | readonly ["descriptionMatches", (this: import("../index.js").UtilThis, pattern: ConditionDescriptionMatches, context: import("../index.js").PrProps | import("../index.js").IssueProps | import("../index.js").ProjectProps) => Promise<boolean>] | readonly ["hasLabel", (this: import("../index.js").UtilThis, condition: ConditionHasLabel, context: import("../index.js").UtilProps) => boolean] | readonly ["isAbandoned", (this: import("../index.js").UtilThis, condition: ConditionIsAbandoned, context: import("../index.js").UtilProps) => boolean] | readonly ["isOpen", (this: import("../index.js").UtilThis, condition: ConditionIsOpen, context: import("../index.js").UtilProps) => boolean] | readonly ["isStale", (this: import("../index.js").UtilThis, condition: ConditionIsStale, context: import("../index.js").UtilProps) => boolean] | readonly ["$not", (this: import("../index.js").UtilThis, condition: ConditionNot, context: import("../index.js").UtilProps) => Promise<boolean>] | readonly ["$only", (this: import("../index.js").UtilThis, condition: ConditionOnlyOne, context: import("../index.js").UtilProps) => Promise<boolean>] | readonly ["$or", (this: import("../index.js").UtilThis, condition: ConditionOr, context: import("../index.js").UtilProps) => Promise<boolean>] | readonly ["titleMatches", (this: import("../index.js").UtilThis, pattern: ConditionTitleMatches, context: import("../index.js").UtilProps) => Promise<boolean>])[];
