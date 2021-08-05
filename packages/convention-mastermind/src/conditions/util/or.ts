import { UtilProps, UtilThis } from "../";
import {
  IssueConditionConfig,
  PRConditionConfig,
  ProjectConditionConfig,
} from "../../../types";
import { evaluator } from "../../evaluator";
const TYPE = "$or";

export interface ConditionOr {
  type: typeof TYPE;
  pattern: [PRConditionConfig | IssueConditionConfig | ProjectConditionConfig];
}

function or(this: UtilThis, condition: ConditionOr, props: UtilProps) {
  let success: boolean = false;

  condition.pattern.forEach((condition) => {
    if (evaluator.call(this, condition, props)) success = true;
  });

  return success;
}

export default [TYPE, or] as const;
