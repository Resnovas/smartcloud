import { ProjectProps } from '.'

const TYPE = 'onColumn'

export interface ConditiononColumn {
  type: typeof TYPE
  project: string
  column: string
}

const onColumn = (condition: ConditiononColumn, pr: ProjectProps) => {
  return (
    pr.localColumn.name == condition.column &&
    pr.project.name == condition.project
  )
}

export default [TYPE, onColumn] as const
