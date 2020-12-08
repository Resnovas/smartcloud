import { IssueProps, ProjectProps, PRProps } from '../'
import { utils } from '../../utils'

const TYPE = 'creatorMatches'

export interface ConditionCreatorMatches {
  type: typeof TYPE
  pattern: string
}

const creatorMatches = (
  condition: ConditionCreatorMatches,
  issue: IssueProps | PRProps | ProjectProps
) => {
  const pattern = utils.parsingData.processRegExpPattern(condition.pattern)
  return pattern.test(issue.creator)
}

export default [TYPE, creatorMatches] as const
