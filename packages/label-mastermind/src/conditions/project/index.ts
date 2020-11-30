import { Condition, handlers as sharedHandlers } from '../util'

export type ProjectCondition = Condition

const handlers = [...sharedHandlers]

export const getProjectConditionHandler = (condition: ProjectCondition) => {
  const handler = handlers.find(handler => handler[0] === condition.type)
  return handler?.[1]
}
