import { Condition, handlers as sharedHandlers } from '../util'

export type IssueCondition = Condition

console.log(sharedHandlers)
const handlers = [...sharedHandlers]

export const getIssueConditionHandler = (condition: IssueCondition) => {
  const handler = handlers.find(handler => handler[0] === condition.type)
  return handler?.[1]
}
