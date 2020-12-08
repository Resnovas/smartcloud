import { IssueProps, ProjectProps, PRProps } from '../'
import { utils } from '../../utils'

const TYPE = 'descriptionMatches'

export interface ConditionDescriptionMatches {
  type: typeof TYPE
  pattern: string
}

const descriptionMatches = (
  condition: ConditionDescriptionMatches,
  issue: IssueProps | PRProps | ProjectProps
) => {
  const pattern = utils.parsingData.processRegExpPattern(condition.pattern)
  return pattern.test(issue.description)
}

export default [TYPE, descriptionMatches] as const
