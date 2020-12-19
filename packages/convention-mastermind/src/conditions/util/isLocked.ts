import { IssueProps, ProjectProps, PRProps } from '..'
import { Issues, Project, PullRequests } from '../../contexts'

const TYPE = 'isLocked'

enum States {
  Open = 'OPEN',
  Closed = 'CLOSED'
}

export interface ConditionIsLocked {
  type: typeof TYPE
  value: boolean
}

function isLocked(
  this: Issues | PullRequests | Project,
  condition: ConditionIsLocked,
  issue: IssueProps | PRProps | ProjectProps
) {
  return (
    this.util.parsingData.normalize(issue.state) ===
    this.util.parsingData.normalize(
      condition.value ? States.Open : States.Closed
    )
  )
}

export default [TYPE, isLocked] as const
