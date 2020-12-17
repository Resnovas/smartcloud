import { loggingData } from '@videndum/utilities'
import {
  IssueConditionConfig,
  PRConditionConfig,
  ProjectConditionConfig,
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
import { Issues, Project, PullRequests } from './contexts'

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
  this: Issues | PullRequests | Project,
  config:
    | PRConditionConfig
    | IssueConditionConfig
    | ProjectConditionConfig
    | SharedConventionsConfig,
  props: PRProps | IssueProps | ProjectProps
) {
  const { conditions, requires } = config
  if (typeof conditions == 'string')
    throw new loggingData(
      '500',
      'String can not be used to evaluate conditions'
    )
  //@ts-ignore
  const matches = forConditions(conditions, condition => {
    const handler =
      props.type == 'issue'
        ? getIssueConditionHandler.call(
            this as Issues,
            condition as IssueCondition
          )
        : props.type == 'pr'
        ? getPRConditionHandler.call(
            this as PullRequests,
            condition as PRCondition
          )
        : getProjectConditionHandler.call(
            this as Project,
            condition as ProjectCondition
          )
    log(new loggingData('100', `The handler is ${handler?.name}`))
    // @ts-ignore
    return handler?.call(this, condition as any, props as any) as boolean
  })
  log(new loggingData('100', `Matches: ${matches}/${requires}`))
  return matches >= requires
}
