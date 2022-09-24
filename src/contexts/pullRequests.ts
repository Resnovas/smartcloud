/** @format */

import * as core from "@actions/core"
import { LoggingDataClass, LoggingLevels } from "@resnovas/utilities"
import { Context } from "vm"
import { log } from ".."
import { Config, Runners, SharedConfig } from "../action"
import { CurContext, PRContext, Reviews, Version } from "../conditions"
import { Utils } from "../utils"
import { Contexts } from "./methods"
import { AssignProject } from "./methods/assignProject"
import { AutomaticApprove } from "./methods/autoApprove"
import { Release } from "./methods/release"
import { RequestApprovals } from "./methods/requestApprovals"
import { SyncRemote } from "./methods/syncRemoteRepo"

/**
 * The Pull Request configuration
 */
export interface PullRequestConfig extends SharedConfig {
	/**
	 *  The project assignment configuration.
	 */
	assignProject?: AssignProject[]
	/**
	 * The automatic approval configuration
	 */
	automaticApprove?: AutomaticApprove
	/**
	 * The release management configuration.
	 */
	manageRelease?: Release
	/**
	 * Syncronise remote repository configuration.
	 */
	syncRemote?: SyncRemote[]
	/**
	 * Request approvals configuration.
	 */
	requestApprovals?: RequestApprovals
}

/**
 * The pull request class.
 */
export class PullRequests extends Contexts {
	context: PRContext
	config: PullRequestConfig
	constructor(
		util: Utils,
		runners: Runners,
		configs: Config,
		curContext: CurContext,
		dryRun: boolean
	) {
		if (curContext.type !== "pr")
			throw new LoggingDataClass(
				LoggingLevels.error,
				"Cannot construct without pr context"
			)
		super(util, runners, configs, curContext, dryRun)
		this.context = curContext.context
		if (!configs.pr)
			throw new LoggingDataClass(
				LoggingLevels.error,
				"Cannot start without config"
			)
		this.config = configs.pr
	}

	/**
	 * Parse the PR Context
	 * @author IvanFon, TGTGamer, jbinda
	 * @since 1.0.0
	 */
	static async parse(
		utils: Utils,
		config: Config,
		context: Context
	): Promise<PRContext | undefined> {
		const pr = context.payload.pull_request
		if (!pr) {
			return
		}

		log(
			LoggingLevels.debug,
			`context.payload.pull_request: ` +
			JSON.stringify(context.payload.pull_request)
		)

		const IDNumber = pr.number
		const labels = await utils.parsingData.labels(pr.labels).catch((err) => {
			log(LoggingLevels.error, `Error thrown while parsing labels: ` + err)
			throw err
		})
		const files: string[] = await utils.api.files
			.list(IDNumber)
			.catch((err) => {
				log(LoggingLevels.error, `Error thrown while listing files: ` + err)
				throw err
			})

		const changes: number = await utils.api.pullRequests
			.changes(pr.additions, pr.deletions)
			.catch((err) => {
				log(LoggingLevels.error, `Error thrown while handling changes: ` + err)
				throw err
			})

		const reviews: Reviews = await utils.api.pullRequests.reviews
			.list(IDNumber)
			.catch((err) => {
				log(LoggingLevels.error, `Error thrown while handling reviews: ` + err)
				throw err
			})

		const pendingReview: boolean = await utils.api.pullRequests.reviews
			.pending(reviews.length, pr.requested_reviewers.length)
			.catch((err) => {
				log(LoggingLevels.error, `Error thrown while handling reviews: ` + err)
				throw err
			})

		const requestedChanges: number = await utils.api.pullRequests.reviews
			.requestedChanges(reviews)
			.catch((err) => {
				log(LoggingLevels.error, `Error thrown while handling reviews: ` + err)
				throw err
			})

		const approved: number = await utils.api.pullRequests.reviews
			.isApproved(reviews)
			.catch((err) => {
				log(LoggingLevels.error, `Error thrown while handling reviews: ` + err)
				throw err
			})

		let currentVersion: Version | undefined = undefined
		if (config.versioning)
			currentVersion = await utils.versioning
				.parse(config, config.issue?.ref)
				.catch((err) => {
					log(
						LoggingLevels.error,
						`Error thrown while parsing versioning: ` + err
					)
					throw err
				})
		return {
			ref: pr.base.ref,
			sha: context.sha,
			action: context.payload.action as string,
			currentVersion,
			IDNumber: context.payload.pull_request?.id,
			props: {
				type: "pr",
				ID: IDNumber,
				branch: pr.head.ref,
				creator: pr.user.login,
				description: pr.body || "",
				isDraft: pr.draft,
				locked: pr.locked,
				state: pr.state,
				title: pr.title,
				files,
				changes,
				reviews,
				labels,
				pendingReview,
				requestedChanges,
				approved
			}
		}
	}

	async run(attempt?: number) {
		if (!this.config) throw new Error("Cannot start without config")
		if (!attempt) {
			attempt = 1
			core.startGroup("Pull Request Actions")
		}
		const seconds = attempt * 10

		try {
			if (this.config.enforceConventions) await this.conventions.enforce(this)
			if (this.config.labels)
				await this.applyLabels(this).catch((err) => {
					log(LoggingLevels.error, "Error applying labels " + err)
				})
			if (this.config.assignProject)
				await this.assignProject(this).catch((err) => {
					log(LoggingLevels.error, "Error assigning projects " + err)
				})
			if (this.config.automaticApprove)
				await this.automaticApprove(this).catch((err) => {
					log(LoggingLevels.error, "Error approving " + err)
				})
			if (this.config.requestApprovals)
				await this.requestApprovals(this).catch((err) => {
					log(LoggingLevels.error, "Error requesting approval " + err)
				})
			if (this.config.manageRelease)
				await this.bumpVersion(this).catch((err) => {
					log(LoggingLevels.error, "Error managing release " + err)
				})
			// create changelog
			// create release
			// sync remote repositories
			// if (this.config.syncRemote) await this.syncRemoteRepo(this)
			core.endGroup()
		} catch (err) {
			if (attempt > this.retryLimit) {
				core.endGroup()
				throw log(
					LoggingLevels.emergency,
					`Pull Request actions failed. Terminating job.`
				)
			}
			log(
				LoggingLevels.warn,
				`Pull Request Actions failed with "${err}", retrying in ${seconds} seconds....`
			)
			attempt++
			setTimeout(async () => {
				this.newVersion = await this.util.versioning.parse(
					this.configs,
					this.config?.ref || this.context.ref
				)
				this.run(attempt)
			}, seconds * 1000)
		}
	}
}
