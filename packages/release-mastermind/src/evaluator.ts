import { loggingData } from '@videndum/utilities'
import {
  getIssueConditionHandler,
  getPRConditionHandler,
  IssueCondition,
  IssueProps,
  log,
  PRCondition,
  ProjectCondition,
  PRProps
} from './conditions'
import {
  IssueConditionConfig,
  PRConditionConfig,
  Release,
  SharedConventionsConfig
} from './types'

export enum ConditionSetType {
  issue = 'issue',
  pr = 'pr',
  project = 'project'
}

const forConditions = <T extends IssueCondition | PRCondition>(
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
  conditionSetType: ConditionSetType,
  config:
    | PRConditionConfig
    | IssueConditionConfig
    | SharedConventionsConfig
    | Release,
  props: PRProps | IssueProps
) {
  const { conditions, requires } = config
  if (typeof conditions == 'string')
    throw new loggingData(
      '500',
      'String can not be used to evaluate conditions'
    )
  const matches = forConditions(conditions, condition => {
    const handler =
      conditionSetType == ConditionSetType.issue
        ? getIssueConditionHandler(condition as IssueCondition)
        : conditionSetType == ConditionSetType.project
        ? getIssueConditionHandler(condition as ProjectCondition)
        : getPRConditionHandler(condition as PRCondition)
    log(new loggingData('100', `The handler is ${handler?.name}`))
    return handler?.(condition as any, props as any) as boolean
  })
  log(new loggingData('100', `Matches: ${matches}/${requires}`))
  return matches >= requires
}
