import type { Condition } from '../util/index.js';
import type { ConditiononColumn } from './on-column.js';
export declare type ProjectCondition = Condition | ConditiononColumn;
export declare const handlers: (readonly ["onColumn", (this: import("../../contexts/issues.js").Issues | import("../../contexts/pull-requests.js").PullRequests | import("../../contexts/projects.js").Project, condition: ConditiononColumn, context: import("../index.js").ProjectProps) => boolean])[];
export type { ProjectProps } from '../index.js';
