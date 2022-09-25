/** @format */

import { LoggingDataClass, LoggingLevels } from "@resnovas/utilities"
import {
	IssueConfig,
	Issues,
	Project,
	ProjectConfig,
	PullRequestConfig,
	PullRequests,
	Schedule
} from ".."
import { Config, Runners } from "../../action"
import {
	CurContext,
	IssueContext,
	PRContext,
	ProjectContext,
	ScheduleContext,
	UtilThis,
	Version
} from "../../conditions"
import { Event, Utils } from "../../utils"
import { applyLabels } from "./applyLabels"
import { assignProject } from "./assignProject"
import { automaticApprove } from "./autoApprove"
import { bumpVersion } from "./bumpVersion"
import { checkStale } from "./checkStale"
import * as conventions from "./conventions"
import { requestApprovals } from "./requestApprovals"
import { syncRemoteProject } from "./syncRemoteProject"
export { log } from "../.."
export * from "./applyLabels"
export * from "./assignProject"
export * from "./autoApprove"
export * from "./changelog"
export * from "./checkStale"
export * from "./conventions"
export * from "./createBranch"
export * from "./handleMilestone"
export * from "./release"
export * from "./syncRemoteProject"
export * from "./syncRemoteRepo"

export class Contexts {
	runners: Runners
	configs: Config
	config: PullRequestConfig | IssueConfig | ProjectConfig
	curContext: CurContext
	context: ProjectContext | IssueContext | PRContext | Partial<ScheduleContext>
	newVersion?: Version = {}
	util: Utils
	retryLimit: number
	dryRun: boolean
	constructor(
		util: Utils,
		runners: Runners,
		configs: Config,
		curContext: CurContext,
		dryRun: boolean
	) {
		if (!runners) throw new Error("Cannot construct without configs")
		this.runners = runners
		if (!configs)
			throw new LoggingDataClass(
				LoggingLevels.error,
				"Cannot construct without configs"
			)
		this.configs = configs
		if (!curContext)
			throw new LoggingDataClass(
				LoggingLevels.error,
				"Cannot construct without context"
			)
		this.curContext = curContext
		const config = configs[curContext.type]
		if (!config)
			throw new LoggingDataClass(
				LoggingLevels.error,
				"Cannot construct without config"
			)
		this.config = config
		// TODO: This needs removing from the label-mastermind config
		if (curContext.type !== "schedule")
			this.newVersion = curContext.context.currentVersion
		this.context = curContext.context
		this.util = util
		this.dryRun = dryRun
		this.retryLimit = configs.retryLimit || 3
	}

	syncRemoteProject = (that: Project) => syncRemoteProject.call(that)
	assignProject = (that: Issues | PullRequests) => assignProject.call(that)
	applyLabels = (that: UtilThis) => applyLabels.call(that)
	checkStale = (that: Issues | PullRequests | Project | Schedule) =>
		checkStale.call(that)
	automaticApprove = (that: PullRequests) => automaticApprove.call(that)
	requestApprovals = (that: PullRequests) => requestApprovals.call(that)
	bumpVersion = (that: PullRequests) => bumpVersion.call(that)

	conventions = {
		enforce: (that: Issues | PullRequests | Project) =>
			conventions.enforce.call(that)
	}

	async createComment(
		this: PullRequests | Issues | Project | Schedule,
		jobName: string,
		success: boolean,
		options?: { body?: string; event?: Event }
	) {
		let prefix = `<!--${process.env.NPM_PACKAGE_NAME}: ${jobName}-->`,
			body =
				prefix + options?.body !== undefined ? "\n\r\n\r" + options?.body : ""

		let commentList =
				this.context.props?.type === "pr"
					? await this.util.api.pullRequests.reviews.list(this.context.props.ID)
					: this.context.props?.ID
					? await this.util.api.issues.comments.list(this.context.props.ID)
					: undefined,
			previousComment: number | undefined

		if (commentList) {
			commentList.forEach((comment: any) => {
				if (
					comment.body.includes(prefix) &&
					(!("state" in comment) || comment.state !== "DISMISSED")
				)
					previousComment = comment.id
			})
		}
		this.util.respond(this, success, {
			event: options?.event,
			previousComment,
			body
		})
	}
}
