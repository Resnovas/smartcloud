import { Condition, handlers as sharedHandlers } from '../util'
import branchMatches, { ConditionBranchMatches } from './branchMatches'

export type PRCondition = Condition | ConditionBranchMatches

const handlers = [...sharedHandlers, branchMatches]

export const getPRConditionHandler = (condition: PRCondition) => {
  const handler = handlers.find(handler => handler[0] === condition.type)
  return handler?.[1]
}

export { PRProps } from '../'
