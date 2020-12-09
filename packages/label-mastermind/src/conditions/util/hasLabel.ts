import { IssueProps, ProjectProps, PRProps } from '../'

const TYPE = 'hasLabel'

export interface ConditionHasLabel {
  type: typeof TYPE
  label: string
  value: boolean
}

const hasLabel = (
  condition: ConditionHasLabel,
  issue: IssueProps | PRProps | ProjectProps
) => {
  return (
    Boolean(issue.labels?.[condition.label.toLowerCase()]) == condition.value
  )
}

export default [TYPE, hasLabel] as const
