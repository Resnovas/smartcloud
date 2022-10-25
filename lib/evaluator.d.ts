import type { IssueConditionConfig, PrConditionConfig, ProjectConditionConfig, UtilProps, UtilThis } from './conditions/index.js';
import type { SharedConventionsConfig } from './contexts/methods/conventions.js';
export declare function evaluator(this: UtilThis, config: PrConditionConfig | IssueConditionConfig | ProjectConditionConfig | SharedConventionsConfig, props: UtilProps): Promise<boolean>;
