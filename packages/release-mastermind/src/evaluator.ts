import { loggingData } from '@videndum/utilities'
import {
  IssueConditionConfig,
  PRConditionConfig,
  ProjectConditionConfig,
  Release,
  SharedConventionsConfig
} from '../types'
import {
  getIssueConditionHandler,
  getPRConditionHandler,
  getProjectConditionHandler,
  IssueCondition,
  IssueProps,
  log,
  PRCondition,
  ProjectCondition,
  ProjectProps,
  PRProps
} from './conditions'

const forConditions = <
  T extends IssueCondition | PRCondition | ProjectCondition
>(
  conditions: T[],
  callback: (condition: T) => boolean
) => {
  let matches = 0
  for (const condition of conditions) {
    log(
      new loggingData(
        '100',
        `Condition: ${JSON.stringify(condition)} == ${callback(condition)}`
      )
    )
    if (callback(condition)) {
      matches++
    }
  }
  return matches
}

export function evaluator(
  config:
    | PRConditionConfig
    | IssueConditionConfig
    | ProjectConditionConfig
    | SharedConventionsConfig
    | Release,
  props: PRProps | IssueProps | ProjectProps
) {
  const { conditions, requires } = config
  if (typeof conditions == 'string')
    throw new loggingData(
      '500',
      'String can not be used to evaluate conditions'
    )
  const matches = forConditions(conditions, condition => {
    const handler =
      props.type == 'issue'
        ? getIssueConditionHandler(condition as IssueCondition)
        : props.type == 'pr'
        ? getPRConditionHandler(condition as PRCondition)
        : getProjectConditionHandler(condition as ProjectCondition)
    log(new loggingData('100', `The handler is ${handler?.name}`))
    return handler?.(condition as any, props as any) as boolean
  })
  log(new loggingData('100', `Matches: ${matches}/${requires}`))
  return matches >= requires
}
