import { IssueProps, ProjectProps, PRProps, ConditionSetType } from '..'
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
    const type = props.type == "issue"
        ? ConditionSetType.issue
        : props.type == "pr"
            ? ConditionSetType.pr
            : ConditionSetType.project

    let success: number = 0

    condition.pattern.forEach(condition => {
        if (evaluator(
            type,
            condition,
            props
        )) success++
    })

    return (success == condition.required)
}

export default [TYPE, only] as const