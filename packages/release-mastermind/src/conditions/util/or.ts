import { IssueProps, ProjectProps, PRProps, ConditionSetType } from '../'
import { evaluator } from '../../evaluator'
import { PRConditionConfig, IssueConditionConfig, ProjectConditionConfig } from '../../../types'
const TYPE = '$or'

export interface ConditionOr {
    type: typeof TYPE,
    pattern: [
        PRConditionConfig | IssueConditionConfig | ProjectConditionConfig,
    ]
}

const or = (
    condition: ConditionOr,
    props: IssueProps | PRProps | ProjectProps
) => {
    const type = props.type == "issue"
        ? ConditionSetType.issue
        : props.type == "pr"
            ? ConditionSetType.pr
            : ConditionSetType.project

    let success: boolean = false

    condition.pattern.forEach(condition => {
        if (evaluator(
            type,
            condition,
            props
        )) success = true
    })

    return success
}

export default [TYPE, or] as const