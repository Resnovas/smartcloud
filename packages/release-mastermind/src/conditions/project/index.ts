import { Condition, handlers as sharedHandlers } from '../util'
import onColumn, { ConditiononColumn } from './onColumn'

export type ProjectCondition = Condition | ConditiononColumn

const handlers = [...sharedHandlers, onColumn]

export const getProjectConditionHandler = (condition: ProjectCondition) => {
  const handler = handlers.find(handler => handler[0] === condition.type)
  return handler?.[1]
}

export { ProjectProps } from '..'
