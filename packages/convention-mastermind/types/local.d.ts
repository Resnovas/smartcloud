import { SharedConditions } from ".";
import { Condition } from "../src/conditions";

export interface SharedLabels {
    [key: string]: SharedConditions
}

export interface IssueConfig extends SharedConfig { }
export interface PullRequestConfig extends SharedConfig { }
export interface ProjectConfig extends SharedConfig { }

export interface SharedConfig {
    ref?: string
    enforceConventions?: EnforceConventions
}

export interface EnforceConventions {
    onColumn?: Column[]
    commentHeader?: string
    commentFooter?: string
    moveToColumn?: string
    conventions: SharedConventionsConfig[]
}

export interface SharedConventionsConfig extends SharedConventionConditions {
    failedComment: string
    contexts?: string[]
}

export interface SharedConventionConditions {
    requires: number
    conditions: Condition[] | string
}

type Column = string | number

export interface SharedLabelConfig {
    requires: number
    conditions: Condition[]
}