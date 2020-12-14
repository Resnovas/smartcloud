import { IssueProps, ProjectProps, PRProps } from '../'
import {
  IssueConditionConfig,
  PRConditionConfig,
  ProjectConditionConfig
} from '../../../types'
import { evaluator } from '../../evaluator'
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
