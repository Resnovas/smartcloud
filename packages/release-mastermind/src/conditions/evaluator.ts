import {
  getIssueConditionHandler,
  getPRConditionHandler,
  IssueCondition,
  IssueProps,
  log,
  PRCondition,
  PRProps
} from '.'
import { conventionsConfig, release } from '../types'

export enum ConditionSetType {
  issue = 'issue',
  pr = 'pr'
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

export default function evaluator(
  conditionSetType: ConditionSetType,
  config: conventionsConfig | release,
  props: PRProps | IssueProps
) {
  const { conditions, requires } = config
  if (typeof conditions == 'string') return
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
