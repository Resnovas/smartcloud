import { IssueProps, ProjectProps, PRProps } from '..'
import { evaluator } from '../../evaluator'
import { PRConditionConfig, IssueConditionConfig, ProjectConditionConfig } from '../../../types'
const TYPE = '$only'

export interface ConditionOnlyOne {
    required: number
    type: typeof TYPE,
    pattern: [
        PRConditionConfig | IssueConditionConfig | ProjectConditionConfig,
    ]
}

const only = (
    condition: ConditionOnlyOne,
    props: IssueProps | PRProps | ProjectProps
) => {
    let success: number = 0

    condition.pattern.forEach(condition => {
        if (evaluator(
            condition,
            props
        )) success++
    })

    return (success == condition.required)
}

export default [TYPE, only] as const