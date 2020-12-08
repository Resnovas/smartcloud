import { IssueProps, ProjectProps, PRProps } from '../'

const TYPE = 'hasLabel'

export interface ConditionHasLabel {
  type: typeof TYPE
  pattern: string
}

const hasLabel = (
  condition: ConditionHasLabel,
  issue: IssueProps | PRProps | ProjectProps
) => {
  return Boolean(issue.labels?.[condition.pattern.toLowerCase()])
}

export default [TYPE, hasLabel] as const
