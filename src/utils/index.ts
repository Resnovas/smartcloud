/** @format */
import simpleGit, { SimpleGit, SimpleGitOptions } from "simple-git"
import { Github } from ".."
import { Config, Label, Runners } from "../action"
import { Reviews, UtilThis } from "../conditions"
import * as APIFiles from "./api/files"
import * as APIIssues from "./api/issues"
import * as APILabels from "./api/labels"
import * as APIProject from "./api/project"
import * as APIPullRequests from "./api/pullRequests"
import * as APITag from "./api/tags"
import * as UtilLabels from "./labels"
import * as UtilParsingData from "./parsingData"
import * as UtilRespond from "./respond"
import * as UtilVersioning from "./versioning"
/**
 * The util class.
 * @private
 */
export class Utils {
	client: Github
	repo: Repo
	dryRun: boolean
	skipDelete: boolean
	ref?: string
	git: SimpleGit
	constructor(
		props: ApiProps,
		options: { dryRun: boolean; skipDelete: boolean; ref?: string },
		{ git }: { git?: SimpleGitOptions }
	) {
		this.client = props.client
		this.repo = props.repo
		this.dryRun = options.dryRun
		this.skipDelete = options.skipDelete
		this.ref = options.ref
		this.git = git
			? simpleGit({
					...git,
					baseDir: !git.baseDir ? process.cwd() : git.baseDir,
					binary: "git",
					maxConcurrentProcesses: 6,
					config: !git.config ? [] : git.config
			  })
			: simpleGit()
	}
	api = {
		files: {
			get: async (file: string, ref?: string) =>
				APIFiles.get.call(this, file, ref),
			list: async (IDNumber: number) => APIFiles.list.call(this, IDNumber)
		},
		issues: {
			get: async (IDNumber: number) => APIIssues.get.call(this, IDNumber),
			create: async (
				title: string,
				body: string,
				labels: string[],
				assignees: string[],
				milestone: string
			) =>
				APIIssues.create.call(this, title, body, labels, assignees, milestone),
			list: async ({
				state,
				sort,
				direction
			}: {
				state?: "open" | "closed" | "all"
				sort?: "created" | "updated" | "comments"
				direction?: "asc" | "desc"
			}) => APIIssues.list.call(this, { state, sort, direction }),
			comments: {
				list: async (IDNumber: number) =>
					APIIssues.comments.list.call(this, IDNumber),
				get: async (IDNumber: number) =>
					APIIssues.comments.get.call(this, IDNumber),
				create: async (IDNumber: number, body: string) =>
					APIIssues.comments.create.call(this, IDNumber, body),
				update: async (comment_id: number, body: string) =>
					APIIssues.comments.update.call(this, comment_id, body),
				delete: async (comment_id: number) =>
					APIIssues.comments.delete.call(this, comment_id)
			}
		},
		labels: {
			add: async (IDNumber: number, label: string) =>
				APILabels.add.call(this, IDNumber, label),
			create: async (label: Label) => APILabels.create.call(this, label),
			del: async (name: string) => APILabels.del.call(this, name),
			get: async () => APILabels.get.call(this),
			remove: async (IDNumber: number, label: string) =>
				APILabels.remove.call(this, IDNumber, label),
			update: async (current_name: string, label: Label) =>
				APILabels.update.call(this, current_name, label)
		},
		project: {
			column: {
				list: async (project_id: number) =>
					APIProject.column.list.call(this, project_id),
				get: async (column_id: number) =>
					APIProject.column.get.call(this, column_id),
				listCards: async (column_id: number) =>
					APIProject.column.listCards.call(this, column_id)
			},
			card: {
				get: async (card_id: number) => APIProject.card.get.call(this, card_id),
				create: async (
					content_id: number,
					column_id: number,
					content_type?: "Issue" | "PullRequest"
				) =>
					APIProject.card.create.call(
						this,
						content_id,
						column_id,
						content_type
					),
				move: async (card_id: number, column_id: number) =>
					APIProject.card.move.call(this, card_id, column_id)
			},
			projects: {
				get: async (project_id: number) =>
					APIProject.projects.get.call(this, project_id),
				org: async (org: string) => APIProject.projects.org.call(this, org),
				user: async (user: string) => APIProject.projects.user.call(this, user),
				repo: async (owner: string, repo: string) =>
					APIProject.projects.repo.call(this, owner, repo)
			}
		},
		pullRequests: {
			list: async (IDNumber: number) =>
				APIPullRequests.list.call(this, IDNumber),
			changes: async (additions: number, deletions: number) =>
				APIPullRequests.changes(additions, deletions),
			reviews: {
				create: async (
					IDNumber: number,
					body?: string,
					event?: Event,
					comments?: any
				) =>
					APIPullRequests.reviews.create.call(
						this,
						IDNumber,
						body,
						event,
						comments
					),
				update: async (IDNumber: number, review_id: number, body: string) =>
					APIPullRequests.reviews.update.call(this, IDNumber, review_id, body),
				dismiss: async (IDNumber: number, review_id: number, message: string) =>
					APIPullRequests.reviews.dismiss.call(
						this,
						IDNumber,
						review_id,
						message
					),
				list: async (IDNumber: number) =>
					APIPullRequests.reviews.list.call(this, IDNumber),
				requestedChanges: async (reviews: Reviews) =>
					APIPullRequests.reviews.requestedChanges.call(this, reviews),
				isApproved: async (reviews: Reviews) =>
					APIPullRequests.reviews.isApproved(reviews),
				pending: async (reviews: number, requested_reviews: number) =>
					APIPullRequests.reviews.pending(reviews, requested_reviews)
			}
		},
		tags: {
			get: async () => APITag.get.call(this)
		}
	}
	labels = {
		sync: async (config: Runners["labels"]) =>
			UtilLabels.sync.call(this, config),
		addRemove: async (
			labelName: string,
			IDNumber: number,
			hasLabel: boolean,
			shouldHaveLabel: boolean
		) =>
			UtilLabels.addRemove.call(
				this,
				labelName,
				IDNumber,
				hasLabel,
				shouldHaveLabel
			)
	}
	parsingData = {
		formatColor: async (color: string) => UtilParsingData.formatColor(color),
		processRegExpPattern: async (pattern: string) =>
			UtilParsingData.processRegExpPattern(pattern),
		normalize: async (text: string) => UtilParsingData.normalize(text),
		labels: async (labels: any) => UtilParsingData.parseLabels(labels)
	}

	respond = async (
		that: UtilThis,
		success: boolean,
		previousComment?: number,
		body?: string
	) => UtilRespond.respond.call(that, success, previousComment, body)
	versioning = {
		parse: async (config: Config, ref?: string) =>
			UtilVersioning.parse.call(this, config, ref)
	}

	shouldRun = (type: functionality) => {
		// get the package name
		let pack = process.env.NPM_PACKAGE_NAME as packages

		/*eslint-disable-next-line @typescript-eslint/no-var-requires */
		if (!pack) pack = require("../../package.json").name as packages

		// Test the fucntion against package

		if (pack == "@videndum/smartcloud") return true
		else if (pack == "@videndum/convention-mastermind" && type == "convention")
			return true
		else if (pack == "@videndum/label-mastermind" && type == "label")
			return true
		else return false
	}
}
export interface Repo {
	owner: string
	repo: string
}
export interface ApiProps {
	client: Github
	repo: Repo
}

export type functionality = "release" | "convention" | "label"
export type packages =
	| "@videndum/smartcloud"
	| "@videndum/label-mastermind"
	| "@videndum/convention-mastermind"
	| undefined

export type Event = "REQUEST_CHANGES" | "APPROVE" | "COMMENT"
export type Tags = string[]
