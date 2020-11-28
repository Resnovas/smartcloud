import {
  getIssueConditionHandler,
  getPRConditionHandler,
  IssueCondition,
  IssueProps,
  log,
  PRCondition,
  PRProps
} from '.'
import {
  IssueConditionConfig,
  PRConditionConfig,
  Release,
  SharedConventionsConfig
} from '../types'

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
    log(`Condition: ${JSON.stringify(condition)} == ${callback(condition)}`, 1)
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
    throw new Error('String can not be used to evaluate conditions')
  const matches = forConditions(conditions, condition => {
    const handler =
      conditionSetType == ConditionSetType.issue
        ? getIssueConditionHandler(condition as IssueCondition)
        : getPRConditionHandler(condition as PRCondition)
    log(`The handler is ${handler?.name}`, 1)
    return handler?.(condition as any, props as any) as boolean
  })
  log(`Matches: ${matches}/${requires}`, 1)
  return matches >= requires
}
