import {
  Condition,
  IssueCondition,
  PRCondition,
  ProjectCondition
} from './conditions/'

/**
 * Configuration interfaces
 */

export interface Options {
  configPath: string
  configJSON: Config[]
  showLogs: boolean
  dryRun: boolean
}

export interface Config {
  projectType: projectType
  retryLimit?: number
  root: string // The root of the project (e.g. "." or "./packages/{package}")
  versioning?: versionType // The type of versioning to apply
  prereleaseName?: string // If you want something other then "prerelease"
  pr?: pullRequestConfig
  issue?: issueConfig
  project?: projectConfig
}

export type projectType = 'node' | 'other'
export type versionType = 'SemVer'

export interface pullRequestConfig {
  ref?: string // Overrides the ref
  enforceConventions?: enforceConventions // enforce the conventions
  automaticApprove?: automaticApprove // Automatically approve PR based on conditions
  manageRelease?: release // Manage releases (includes tags, milestones, packages and more)
  duplicateHotfix?: duplicateHotfix // Duplicated a hotfix to the main branch
  syncRemote?: syncRemote[] // sync a remote repository
}

interface issueConfig {
  ref?: string
  assignProject?: assignProject
  assignColumn?: AssignColumn
  createBranch?: createBranch
}

interface projectConfig {
  ref?: string
  enforceConventions?: enforceConventions
  syncRemote?: exProjects[]
  openBranch?: openBranch
  assignMilestone?: milestones[]
}

/**
 * Individual Interfaces
 */

export interface release extends PRConditionConfig {
  labels?: {
    build: string
    prerelease: string
    patch: string
    minor: string
    major: string
    breaking?: string
  }
  createTag?: boolean
  createRelease?: createRelease | boolean
  createMilestone?: createMilestone
  createPackages?: string[] | string
  createChangelog?: changelog
}
interface createRelease extends releaseChanges {
  tagName?: string
  tagPrefix?: string
  releaseName?: string
  releaseNamePrefix?: string
  releaseNameSuffix?: string
  draft?: boolean
  prerelease?: boolean
  useChangelog?: boolean
}
interface changelog extends releaseChanges {
  title?: string
  body?: string
}
interface releaseChanges {
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
interface changelog {}
interface syncRemote {
  localBranch: string
  remoteBranch: string
  localPath: string
  remotePath: string
}
interface createMilestone {
  milestone: 'version' | string
  deadline?: string
}
interface nodeJS {
  filename: string
}
interface duplicateHotfix {
  [title: string]: {
    prName: 'unchanged' | 'number' | string
    titlePrefix?: string
    branches: string[]
  }
}
interface createBranch {
  [label: string]: {
    branchPrefix?: string
    branchSuffix?: string
    branchName: 'title' | 'short' | 'number'
  }
}
interface AssignColumn {
  [label: string]: {
    column: string
  }
}
interface openBranch {
  onProject?: boolean
  onColumn?: string
}
interface assignProject extends ProjectConditionConfig {
  project: string
  column: string
}
interface milestones {
  [milestone: string]: {
    onColumn: string
    ignoreLabels?: string[]
  }
}
interface exProjects {
  owner: string
  repo?: string
  project: string
}

interface automaticApprove {
  commentHeader?: string // will go above the list of failed comments
  commentFooter?: string // will go below the list of failed comments
  conventions: conventionsConfig[]
}

interface enforceConventions {
  commentHeader?: string // will go above the list of failed comments
  commentFooter?: string // will go below the list of failed comments
  moveToColumn?: string // optionally move card to another column on failure
  conventions: conventionsConfig[]
}
export interface conventionsConfig extends SharedConfig {
  failedComment: string // short comment to explain the condition
  contexts?: string[]
}

interface SharedConfig {
  requires: number
  conditions: Condition[] | string
}

interface ProjectConditionConfig {
  requires: number
  conditions: ProjectCondition[]
}

interface IssueConditionConfig {
  requires: number
  conditions: IssueCondition[]
}

interface PRConditionConfig {
  requires: number
  conditions: PRCondition[]
}

export type CurContext =
  | { type: 'pr'; context: PRContext }
  | { type: 'issue'; context: IssueContext }

interface Props {
  creator: string
  description: string
  state: 'open' | 'closed'
  title: string
}

export interface PRProps extends Props {
  branch: string
}

export interface IssueProps extends Props {}
export interface ProjectProps extends Props {}

export type Tags = string[]

export type Labels = string[]

interface GeneralContext {
  ref?: string
  action: string
  currentVersion: version
  labels: Labels
  IDNumber: number
}

export interface version {
  name?: string
  semantic?: {
    major: number
    minor: number
    patch: number
    prerelease?: string
    build?: number
  }
}

export interface PRContext extends GeneralContext {
  prProps: PRProps
}

export interface IssueContext extends GeneralContext {
  issueProps: IssueProps
}
export type event = 'REQUEST_CHANGES' | 'APPROVE' | 'COMMENT'
