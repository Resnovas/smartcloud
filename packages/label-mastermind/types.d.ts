import {
  IssueCondition,
  PRCondition,
  Condition,
  ProjectCondition
} from './src/conditions/'

export interface IssueConditionConfig {
  requires: number
  conditions: IssueCondition[]
}

export interface PRConditionConfig {
  requires: number
  conditions: ProjectCondition[]
}

export interface SharedConfig {
  requires: number
  conditions: Condition[]
}

export interface Config {
  projectType: ProjectType
  root: string
  versioning?: VersionType
  labels: {
    [key: string]: {
      name: string
      color: string
      description: string
    }
  }
  shared: {
    [key: string]: SharedConfig
  }
  issue: IssueConfig
  pr: PullRequestConfig
  project: ProjectConfig
  skip_labeling: string
  delete_labels: boolean
}

export interface IssueConfig {
  ref?: string
  labels: {
    [key: string]: IssueConditionConfig
  }
}
export interface PullRequestConfig {
  ref?: string
  labels: {
    [key: string]: PRConditionConfig
  }
}
export interface ProjectConfig {
  ref?: string
  labels: {
    [key: string]: SharedConfig
  }
}
export interface ProjectConditionConfig {
  requires: number
  conditions: ProjectCondition[]
}
export interface Label {
  name: string
  description: string
  color: string
}

export interface Labels {
  [key: string]: Label
}

export interface Options {
  configPath: string
  configJSON: Config
  showLogs: boolean
  dryRun: boolean
}

export type Runners = Config
export type ProjectType = 'node' | 'other'
export type VersionType = 'SemVer'
