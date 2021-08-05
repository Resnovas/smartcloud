/** @format */

import {
	Condition,
	IssueCondition,
	PRCondition,
	ProjectCondition,
	ScheduleCondition
} from "../src/conditions"
import { Repo } from "../src/utils"

/**
 * Application interfaces
 */

export interface Options {
	configPath: string
	configJSON: Runners
	showLogs: boolean
	dryRun: boolean
	fillEmpty: boolean
	skipDelete: boolean
	repo?: Repo
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
	schedule?: ScheduleConfig
}

/**
 * Config types.
 */

export type VersionSource = "node" | "milestones" | string
export type VersionType = "SemVer"

export interface SharedConditions {
	requires: number
	conditions: Condition[]
}

export interface Label {
	name: string
	description: string
	color: string
}

export interface Labels {
	[key: string]: Label
}

export interface PRConditionConfig {
	requires: number
	conditions: PRCondition[]
}

export interface IssueConditionConfig {
	requires: number
	conditions: IssueCondition[]
}

export interface ProjectConditionConfig {
	requires: number
	conditions: ProjectCondition[]
}

export interface ScheduleConditionConfig {
	requires: number
	conditions: ScheduleCondition[]
}

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

export interface ScheduleConfig extends SharedConfig {}

export type SharedConfigIndex =
	| "ref"
	| "enforceConventions"
	| "labels"
	| "stale"

export interface SharedConfig {
	ref?: string
	enforceConventions?: EnforceConventions
	stale?: Stale
	labels?: {
		[key: string]:
			| IssueConditionConfig
			| ProjectConditionConfig
			| PRConditionConfig
			| ScheduleConditionConfig
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
	branchName: "title" | "short" | "number"
}

export interface EnforceConventions {
	onColumn?: Column[]
	commentHeader?: string
	commentFooter?: string
	moveToColumn?: string
	conventions: SharedConventionsConfig[]
}

export interface Stale {
	staleLabel: string
	stale?: StaleConfig
	abandoned?: AbanondedConfig
	conditions?: SharedConditions[]
}

export interface StaleConfig extends SharedConditions {
	days: number
	comment?: string
	resolve?: string
	commentHeader?: string
	commentFooter?: string
}

export interface AbanondedConfig extends StaleConfig {
	close?: boolean
	lock?: boolean
	label: string
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
	prName: "unchanged" | "number" | string
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
	milestone: "version" | string
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
