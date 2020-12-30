import {
  IssueConditionConfig,
  PRConditionConfig,
  ProjectConditionConfig,
  SharedConditions
} from '.'
import { Condition } from '../src/conditions'

export interface PullRequestConfig extends SharedConfig {
  assignProject?: AssignProject[]
  automaticApprove?: AutomaticApprove
  manageRelease?: Release
  duplicateHotfix?: { [title: string]: DuplicateHotfix }
  syncRemote?: SyncRemote[]
}

export interface IssueConfig extends SharedConfig {
  assignProject?: AssignProject[]
  createBranch?: { [label: string]: CreateBranch }
}

export interface ProjectConfig extends SharedConfig {
  syncRemote?: ExProjects[]
  openBranch?: ProjectCreateBranch
  assignMilestone?: { [milestone: string]: Milestones }
}

export interface SharedConfig {
  ref?: string
  enforceConventions?: EnforceConventions
  labels?: {
    [key: string]:
      | IssueConditionConfig
      | ProjectConditionConfig
      | PRConditionConfig
      | SharedConditions
  }
}

export interface SharedConventionConditions {
  requires: number
  conditions: Condition[] | string
}
export interface SharedConventionsConfig extends SharedConventionConditions {
  failedComment: string
  contexts?: string[]
}

export interface CreateBranch {
  branchPrefix?: string
  branchSuffix?: string
  branchName: 'title' | 'short' | 'number'
}

export interface EnforceConventions {
  onColumn?: Column[]
  commentHeader?: string
  commentFooter?: string
  moveToColumn?: string
  conventions: SharedConventionsConfig[]
}

export interface AutomaticApprove {
  commentHeader?: string
  commentFooter?: string
  conventions: SharedConventionsConfig[]
}

export interface Release extends PRConditionConfig {
  labels?: {
    build: string
    prerelease: string
    patch: string
    minor: string
    major: string
    breaking?: string
  }
  createTag?: boolean
  createRelease?: CreateRelease
  createMilestone?: CreateMilestone
  createPackages?: string[] | string
  createChangelog?: Changelog
}

export interface DuplicateHotfix {
  prName: 'unchanged' | 'number' | string
  titlePrefix?: string
  branches: string[]
}
export interface SyncRemote {
  localBranch: string
  remoteBranch: string
  localPath: string
  remotePath: string
  conditions: SharedConditions[]
}

export interface ReleaseChanges {
  includeIssues?: boolean
  sections?: Sections[]
}

export interface Sections {
  title: string
  body?: string
  PRlabels: string[]
  issueLabels?: string[]
  includeCommitter?: boolean
  linkPR?: boolean
}

export interface CreateRelease extends ReleaseChanges {
  tagName?: string
  tagPrefix?: string
  releaseName?: string
  releaseNamePrefix?: string
  releaseNameSuffix?: string
  draft?: boolean
  prerelease?: boolean
  useChangelog?: boolean
}
export interface Changelog extends ReleaseChanges {
  title?: string
  body?: string
}

export interface CreateMilestone {
  milestone: 'version' | string
  deadline?: string
}

export type Column = string | number

interface AssignProject extends IssueConditionConfig {
  owner?: string
  user?: string
  repo?: string
  project: string
  column: string
}

interface ExProjects {
  localProject: string
  owner?: string
  user?: string
  repo?: string
  project: string
}
interface ProjectCreateBranch extends CreateBranch {
  onProject?: string
  onColumn?: string
}

interface Milestones {
  onColumn: string
  ignoreLabels?: string[]
}
