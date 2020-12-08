import { IssueProps, ProjectProps, PRProps } from '../'
import { utils } from '../../utils'

const TYPE = 'titleMatches'

export interface ConditionTitleMatches {
  type: typeof TYPE
  pattern: string
}

const titleMatches = (
  condition: ConditionTitleMatches,
  issue: IssueProps | PRProps | ProjectProps
) => {
  const pattern = utils.parsingData.processRegExpPattern(condition.pattern)
  return pattern.test(issue.title)
}

export default [TYPE, titleMatches] as const
