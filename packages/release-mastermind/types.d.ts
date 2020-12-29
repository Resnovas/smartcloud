import {
  Condition,
  IssueCondition,
  PRCondition,
  ProjectCondition
} from './src/conditions'

/**
 * Application interfaces
 */

export interface Options {
  configPath: string
  configJSON: Runners
  showLogs: boolean
  dryRun: boolean
}

export interface Runners {
  labels?: Labels
  runners: Config[]
}

export interface Config {
  root: string
  versioning: {
    source: VersionSource
    type?: VersionType
  }
  retryLimit?: number
  prereleaseName?: string
  labels?: { [key: string]: string }
  sharedConfig?: SharedConfig
  pr?: PullRequestConfig
  issue?: IssueConfig
  project?: ProjectConfig
}

/**
 * Config types
 */

export type VersionSource = 'node' | 'milestones' | string
export type VersionType = 'SemVer'

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

/**
 * shared types
 */
interface SharedConfig {
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

interface SharedConventionConditions {
  requires: number
  conditions: Condition[] | string
}
export interface SharedConditions {
  requires: number
  conditions: Condition[]
}

export interface SharedConventionsConfig extends SharedConventionConditions {
  failedComment: string
  contexts?: string[]
}

interface CreateBranch {
  branchPrefix?: string
  branchSuffix?: string
  branchName: 'title' | 'short' | 'number'
}

interface EnforceConventions {
  onColumn?: Column[]
  commentHeader?: string
  commentFooter?: string
  moveToColumn?: string
  conventions: SharedConventionsConfig[]
}

export type Column = string | number
export interface Label {
  name: string
  description: string
  color: string
}

export interface Labels {
  [key: string]: Label
}

/**
 * Pull Request Config types
 */

export interface PRConditionConfig {
  requires: number
  conditions: PRCondition[]
}

interface AutomaticApprove {
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

interface DuplicateHotfix {
  prName: 'unchanged' | 'number' | string
  titlePrefix?: string
  branches: string[]
}
interface SyncRemote {
  localBranch: string
  remoteBranch: string
  localPath: string
  remotePath: string
  conditions: SharedConditions[]
}

interface ReleaseChanges {
  includeIssues?: boolean
  sections?: Sections[]
}

interface Sections {
  title: string
  body?: string
  PRlabels: string[]
  issueLabels?: string[]
  includeCommitter?: boolean
  linkPR?: boolean
}

interface CreateRelease extends ReleaseChanges {
  tagName?: string
  tagPrefix?: string
  releaseName?: string
  releaseNamePrefix?: string
  releaseNameSuffix?: string
  draft?: boolean
  prerelease?: boolean
  useChangelog?: boolean
}
interface Changelog extends ReleaseChanges {
  title?: string
  body?: string
}

interface CreateMilestone {
  milestone: 'version' | string
  deadline?: string
}

/**
 * Issue Config types
 */
export interface IssueConditionConfig {
  requires: number
  conditions: IssueCondition[]
}

interface AssignProject extends IssueConditionConfig {
  owner?: string
  user?: string
  repo?: string
  project: string
  column: string
}

/**
 * Project Config types
 */

export interface ProjectConditionConfig {
  requires: number
  conditions: ProjectCondition[]
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
