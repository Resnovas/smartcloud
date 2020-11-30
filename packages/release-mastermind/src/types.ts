import {
  Condition,
  IssueCondition,
  PRCondition,
  ProjectCondition
} from './conditions/'

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
  projectType: ProjectType
  root: string // The root of the project (e.g. "." or "./packages/{package}")
  versioning?: VersionType // The type of versioning to apply
  retryLimit?: number
  prereleaseName?: string // If you want something other then "prerelease"
  labels?: { [key: string]: string }
  sharedLabelsConfig?: SharedLabels
  pr?: PullRequestConfig
  issue?: IssueConfig
  project?: ProjectConfig
}

/**
 * Config types
 */

export type ProjectType = 'node' | 'other'
export type VersionType = 'SemVer'
interface SharedLabels {
  [key: string]: SharedConditions
}

export interface PullRequestConfig extends SharedConfig {
  automaticApprove?: AutomaticApprove // Automatically approve PR based on conditions
  manageRelease?: Release // Manage releases (includes tags, milestones, packages and more)
  duplicateHotfix?: DuplicateHotfix // Duplicated a hotfix to the main branch
  syncRemote?: SyncRemote[] // sync a remote repository
}

export interface IssueConfig extends SharedConfig {
  assignProject?: AssignProject
  createBranch?: IssueCreateBranch
}

export interface ProjectConfig extends SharedConfig {
  syncRemote?: ExProjects[]
  openBranch?: ProjectCreateBranch
  assignMilestone?: Milestones[]
}

/**
 * shared types
 */
interface SharedConfig {
  ref?: string // Overrides the ref
  enforceConventions?: EnforceConventions // enforce the conventions
  labels: {
    [key: string]:
      | IssueConditionConfig
      | ProjectConditionConfig
      | PRConditionConfig
  }
}

interface SharedConventionConditions {
  requires: number
  conditions: Condition[] | string
}
interface SharedConditions {
  requires: number
  conditions: Condition[]
}

export interface SharedConventionsConfig extends SharedConventionConditions {
  failedComment: string // short comment to explain the condition
  contexts?: string[]
}

interface CreateBranch {
  branchPrefix?: string
  branchSuffix?: string
  branchName: 'title' | 'short' | 'number'
}

interface EnforceConventions {
  onColumn?: Column[] // optionally move card to another column on failure
  commentHeader?: string // will go above the list of failed comments
  commentFooter?: string // will go below the list of failed comments
  moveToColumn?: string // optionally move card to another column on failure
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
  commentHeader?: string // will go above the list of failed comments
  commentFooter?: string // will go below the list of failed comments
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
  [title: string]: {
    prName: 'unchanged' | 'number' | string
    titlePrefix?: string
    branches: string[]
  }
}
interface SyncRemote {
  localBranch: string
  remoteBranch: string
  localPath: string
  remotePath: string
}

interface ReleaseChanges {
  includeIssues?: boolean
  sections?: Sections[]
}

interface Sections {
  title: string
  body?: string
  PRlabels: Labels
  issueLabels?: Labels
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
  project: string
  column: string
}

interface IssueCreateBranch {
  [label: string]: CreateBranch
}

/**
 * Project Config types
 */

interface ProjectConditionConfig {
  requires: number
  conditions: ProjectCondition[]
}

interface ExProjects {
  owner: string
  repo?: string
  project: string
}
interface ProjectCreateBranch extends CreateBranch {
  onProject?: boolean
  onColumn?: string
}

interface Milestones {
  [milestone: string]: {
    onColumn: string
    ignoreLabels?: string[]
  }
}
