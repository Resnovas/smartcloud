/** @format */

import * as core from "@actions/core"
import { context as Context } from "@actions/github"
import { GitHub } from "@actions/github/lib/utils"
import { LoggingDataClass, LoggingLevels } from "@resnovas/utilities"
import { log, Options } from "."
import {
	CurContext,
	IssueConditionConfig,
	PRConditionConfig,
	ProjectConditionConfig,
	ScheduleConditionConfig,
	SharedConditions
} from "./conditions"
import {
	IssueConfig,
	Issues,
	Project,
	ProjectConfig,
	PullRequestConfig,
	PullRequests,
	Schedule,
	ScheduleConfig
} from "./contexts"
import { Stale } from "./contexts/methods/checkStale"
import { EnforceConventions } from "./contexts/methods/conventions"
import { Utils } from "./utils"

export interface Runners {
	/**
	 * Declaritively specify which schema you want to use. This defaults to our latest schema specified at: https://raw.githubusercontent.com/resnovas/smartcloud/main/schema.json
	 * @default https://raw.githubusercontent.com/resnovas/smartcloud/main/schema.json
	 */
	$schema: string
	/**
	 * Declaritively specify all the labels that shuold exist in this repository, and initialise them.
	 * You will use the names specified here later to apply these same labels to issues and pull requests.
	 */
	labels?: Labels
	/**
	 * This defines all the diffent configurations for your repository. 
	 * You can have as many as you like. You can use this within Mono-repositories to have different configurations for different projects.
	 * You can also have diffeent configurations for different branches.
	 */
	runners: Config[]
}

export interface Config {
	/**
	 * The branch used to get the config file from. Defaults to master.
	 */
	branch?: string
	/**
	 * Versioning configuration used for release management.
	 */
	versioning?: {
		/**
		 * Version source used to determine the version.
		 */
		source: VersionSource
		/**
		 * Version Type to change how versioning is handled.
		 */
		type?: VersionType
		/**
		 * If version is a pre-release, this is the version name to use.
		 */
		prereleaseName?: string
	}
	/**
	 * Maximum number of attempts before stopping.
	 * @default 3
	 */
	retryLimit?: number
	/**
	 * The labels used by our internal tools.
	 * @private
	 */
	labels?: {
		[key: string]: string
	}
	/**
	 * Shared configurations, merged with the PR, Issue, Project and Schedule configurations.
	 */
	sharedConfig?: SharedConfig
	/**
	 * The pull request configurations.
	 */
	pr?: PullRequestConfig
	/**
	 * The issue configurations.
	 */
	issue?: IssueConfig
	/**
	 * The project configurations.
	 */
	project?: ProjectConfig
	/**
	 * The schedule configurations.
	 */
	schedule?: ScheduleConfig
}

/**
 * The shared configuration Index
 * @private
 */
export type SharedConfigIndex =
	| "ref"
	| "enforceConventions"
	| "labels"
	| "stale"

/**
 * The shared configuration
 */
export interface SharedConfig {
	/**
	 * The reference used internally
	 */
	ref?: string
	/**
	 * 	The enforceConventions configuration
	 */
	enforceConventions?: EnforceConventions
	/**
	 *	The stale configuration
	 */
	stale?: Stale
	/**
	 * The labels to be applied
	 */
	labels?: {
		[key: string]:
		| IssueConditionConfig
		| ProjectConditionConfig
		| PRConditionConfig
		| ScheduleConditionConfig
		| SharedConditions
	}
}

/**
 * The labels configuration.
 * @param name The name as appears on github
 * @param description A description of the label
 * @param color The color of the label
 */
export interface Label {
	/**
	 * The name as appears on github
	 */
	name: string
	/**
	 * A description of the label
	 */
	description?: string
	/**
	 * The color of the label
	 */
	color: string
}

/**
 *	An array of labels.
 */
export interface Labels {
	/**
	 * And identifiable label name as the key, followed by the label configuration.
	 * @example "bug": {name: "bug", description: "A bug has been found", color: "red"
	 */
	[key: string]: Label
}
/**
 * The version source.
 * Node: A node project, our package will use the package.json to determine the version.
 * Milestones: Utilises the Github Milestone API to determine the version.
 * String: A string to use as the version.
 */
export type VersionSource = "node" | "milestones" | string

/**
 * The version number type. This is used to determine how versioning is handled. SemVer is the default.
 */
export type VersionType = "SemVer"

export type Github = InstanceType<typeof GitHub>

let local: any
let context = Context

try {
	local = require("../config.json")
	process.env.GITHUB_REPOSITORY = local.GITHUB_REPOSITORY
	process.env.GITHUB_REPOSITORY_OWNER = local.GITHUB_REPOSITORY_OWNER
	if (!context.payload.issue && !context.payload.pull_request)
		context = require(local.github_context)
} catch { }


export default class Action {
	client: Github
	opts: Options
	configJSON: Options["configJSON"]
	configPath: Options["configPath"]
	configRef: Options["configRef"]
	dryRun: Options["dryRun"]
	fillEmpty: Options["fillEmpty"]
	repo = context.repo || {}
	util: Utils
	ref?: string

	constructor(client: Github, options: Options) {
		log(
			LoggingLevels.debug,
			`Release Mastermind Constructed: ${options.toString()}`
		)
		core.startGroup("Setup Phase")
		this.client = client
		this.opts = options
		this.dryRun = options.dryRun
		if (this.dryRun) {
			if (options.repo) this.repo = options.repo
			if (!options.repo?.repo)
				this.repo.repo = process.env.GITHUB_REPOSITORY || "Unknown"
			if (!options.repo?.owner)
				this.repo.owner = process.env.GITHUB_REPOSITORY_OWNER || "Unknown"
		}
		this.configJSON = options.configJSON
		this.configPath = options.configPath
		this.configRef = options.configRef
		this.fillEmpty = options.fillEmpty
		this.ref = options.ref || context.ref
		this.util = new Utils(
			{ client, repo: this.repo },
			{ dryRun: options.dryRun, skipDelete: options.skipDelete, ref: this.ref },
			{
				git: options.git
			}
		)
	}

	async run() {
		log(LoggingLevels.debug, `Repo data: ${this.repo.owner}/${this.repo.repo}`)

		/**
		 * Capture and log context to debug for Local Running
		 * @author TGTGamer
		 * @since 1.0.0
		 */
		log(
			LoggingLevels.debug,
			`Context for local running. See readme.md for information on how to setup local running: ${JSON.stringify(
				context
			)}`
		)
		/**
		 * Process the config
		 * @author TGTGamer
		 * @since 1.1.0
		 */
		const configs = await this.processConfig().catch((err) => {
			log(
				LoggingLevels.error,
				`Error thrown while processing config: ` + err
			)
			throw `Error thrown while processing config: ` + err
		})
		if (!configs.runners[0]) {
			await log(LoggingLevels.error, `No config data.`)
			throw `No config data.`
		}
		log(LoggingLevels.debug, `Config: ${JSON.stringify(configs)}`)

		if (configs.labels && this.util.shouldRun("label")) {
			/**
			 * Syncronise the labels
			 * @author TGTGamer
			 * @since 1.1.0
			 */
			core.startGroup("label Actions")
			log(LoggingLevels.debug, `Attempting to apply labels`)
			await this.syncLabels(configs).catch(async (err) => {
				await log(
					LoggingLevels.debug,
					`Error thrown while syncronising labels: ` + err
				)
				throw `Error thrown while syncronising labels: ` + err
			})
			log(LoggingLevels.notice, `Successfully applied all labels`)
			core.endGroup()
		}

		// Run each release manager
		configs.runners.forEach(async (config) => {
			/**
			 * Convert label ID's to Names
			 * @author TGTGamer
			 * @since 1.1.0
			 */
			config.labels = Object.entries(
				configs.labels ? configs.labels : []
			).reduce((acc: { [key: string]: string }, cur) => {
				acc[cur[0]] = cur[1].name
				return acc
			}, {})

			/**
			 * Get the context
			 * @author TGTGamer
			 * @since 1.1.0
			 */
			const curContext = await this.processContext(config).catch(async (err) => {
				await log(
					LoggingLevels.error,
					`Error thrown while processing context: ` + err
				)
				throw `Error thrown while processing context: ` + err
			})
			log(LoggingLevels.debug, `Current Context: ${JSON.stringify(curContext)}`)

			/**
			 * Combine the Shared & Context.type Configs
			 * @author TGTGamer
			 * @since 1.1.0
			 */

			for (const a in config.sharedConfig) {
				const action = a as SharedConfigIndex
				if (!action || (!config[curContext.type] && !this.fillEmpty)) return
				else if (!config[curContext.type]) config[curContext.type] = {}
				if (action == "labels" && this.util.shouldRun("label")) {
					for (const label in config.sharedConfig.labels) {
						if (!config[curContext.type]!.labels)
							config[curContext.type]!.labels = {}
						if (!(label in config[curContext.type]!)) {
							const l = config.sharedConfig.labels[label]
							if (l) config[curContext.type]!.labels![label] = l
						}
					}
				} else if (
					action === "enforceConventions" || action === "stale"
				) {
					// @ts-expect-error - Property 'conventions' is missing in type 'Stale' but required in type 'EnforceConventions'
					config[curContext.type]![action] = config.sharedConfig[action]
				}
			}
			core.endGroup()
			this.applyContext(configs, config, curContext)
		})
	}

	/**
	 * Get the configuration
	 * @author IvanFon, TGTGamer, jbinda
	 * @since 1.0.0
	 */
	async processConfig(): Promise<Runners> {
		if (!this.configJSON?.runners[0]) {
			if (!this.configPath)
				throw new Error(
					`Configpath  (${this.configPath}) & configJSON are undefined`
				)
			const pathConfig = await JSON.parse(
				await this.util.api.files.get(this.configPath, this.configRef)
			)
			if (!pathConfig)
				throw new Error(`config not found at "${this.configPath}"`)
			if (!pathConfig.releaseMastermind) return pathConfig
			else return pathConfig.releaseMastermind
		} else {
			return this.configJSON
		}
	}

	/**
	 * Handle the context
	 * @author IvanFon, TGTGamer, jbinda
	 * @since 1.0.0
	 */
	async processContext(config: Config) {
		let curContext: CurContext

		if (context.payload.pull_request) {
			/**
			 * Pull Request Context
			 * @author IvanFon, TGTGamer, jbinda
			 * @since 1.0.0
			 */
			const ctx = await PullRequests.parse(this.util, config, context).catch(
				async (err) => {
					await log(
						LoggingLevels.error,
						`Error thrown while parsing PR context: ` + err
					)
					throw `Error thrown while parsing PR context: ` + err
				}
			)
			if (!ctx) {
				await log(
					LoggingLevels.error,
					"Pull Request not found on context"
				)
				throw "Pull Request not found on context"
			}
			log(LoggingLevels.debug, `PR context: ${JSON.stringify(ctx)}`)
			curContext = {
				type: "pr",
				context: ctx
			}
		} else if (context.payload.issue) {
			/**
			 * Issue Context
			 * @author IvanFon, TGTGamer, jbinda
			 * @since 1.0.0
			 */
			const ctx = await Issues.parse(this.util, config, context).catch(
				async (err) => {
					await log(
						LoggingLevels.error,
						`Error thrown while parsing issue context: ` + err
					)
					throw `Error thrown while parsing issue context: ` + err
				}
			)
			if (!ctx) {
				throw new Error("Issue not found on context")
			}
			log(LoggingLevels.debug, `issue context: ${JSON.stringify(ctx)}`)

			curContext = {
				type: "issue",
				context: ctx
			}
		} else if (context.payload.project_card) {
			/**
			 * Project Context
			 * @author TGTGamer
			 * @since 1.0.0
			 */
			const ctx = await Project.parse(this.util, config, context).catch(
				(err) => {
					log(
						LoggingLevels.error,
						`Error thrown while parsing Project context: ` + err
					)
					throw `Error thrown while parsing Project context: ` + err
				}
			)
			if (!ctx) {
				throw new Error("Project Card not found on context")
			}
			log(LoggingLevels.debug, `Project Card context: ${JSON.stringify(ctx)}`)

			curContext = {
				type: "project",
				context: ctx
			}
		} else if (context.payload.schedule) {
			/**
			 * Project Schedule Context
			 * @author TGTGamer
			 * @since 1.0.0
			 */
			const ctx = await Schedule.parse(context).catch((err) => {
				log(
					LoggingLevels.error,
					`Error thrown while parsing Schedule context: ` + err
				)
				throw `Error thrown while parsing Schedule context: ` + err
			})
			if (!ctx) {
				throw new Error("Schedule not found on context")
			}
			log(LoggingLevels.debug, `Schedule context: ${JSON.stringify(ctx)}`)

			curContext = {
				type: "schedule",
				context: ctx
			}
		} else {
			/**
			 * No Context
			 * @author TGTGamer
			 * @since 1.1.0
			 */
			log(
				LoggingLevels.notice,
				`There is no context to parse: ${JSON.stringify(context.payload)}`
			)
			throw `There is no context to parse: ${JSON.stringify(context.payload)}`
		}
		return curContext
	}

	/**
	 * Syncronise labels to repository
	 * @author IvanFon, TGTGamer, jbinda
	 * @since 1.0.0
	 */
	async syncLabels(config: Runners) {
		const labels = Object.entries(config.labels ? config.labels : []).reduce(
			(acc: { [key: string]: Label }, cur) => {
				if (cur[0] === "$schema") return acc
				acc[cur[1].name.toLowerCase()] = cur[1]
				return acc
			},
			{}
		)

		await this.util.labels.sync(labels).catch((err) => {
			log(
				LoggingLevels.error,
				`Error thrown while handling syncLabels tasks:`,
				err
			)
		})
	}

	applyContext(runners: Runners, config: Config, curContext: CurContext) {
		let ctx: PullRequests | Issues | Project | Schedule | undefined =
			curContext.type == "pr"
				? new PullRequests(this.util, runners, config, curContext, this.dryRun)
				: curContext.type == "issue"
					? new Issues(this.util, runners, config, curContext, this.dryRun)
					: curContext.type == "project"
						? new Project(this.util, runners, config, curContext, this.dryRun)
						: curContext.type == "schedule"
							? new Schedule(this.util, runners, config, curContext, this.dryRun)
							: undefined

		if (!ctx)
			throw new LoggingDataClass(LoggingLevels.error, "Context not found")

		ctx.run().catch((err) => {
			throw log(
				LoggingLevels.error,
				`Error thrown while running context: ` + err
			)
		})
	}
}
