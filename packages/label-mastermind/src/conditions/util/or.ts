import { IssueProps, ProjectProps, PRProps } from '../'
import { evaluator } from '../../evaluator'
import {
  PRConditionConfig,
  IssueConditionConfig,
  ProjectConditionConfig
} from '../../../types'
const TYPE = '$or'

export interface ConditionOr {
  type: typeof TYPE
  pattern: [PRConditionConfig | IssueConditionConfig | ProjectConditionConfig]
}

const or = (
  condition: ConditionOr,
  props: IssueProps | PRProps | ProjectProps
) => {
  let success: boolean = false

  condition.pattern.forEach(condition => {
    if (evaluator(condition, props)) success = true
  })

  return success
}

export default [TYPE, or] as const
