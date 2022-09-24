/** @format */

import * as core from "@actions/core"
import { LoggingLevels } from "@resnovas/utilities"
import { Issues, Project, PullRequests } from ".."
import { log } from "../.."
import { Condition, SharedConventionConditions } from "../../conditions"
import { evaluator } from "../../evaluator"
import { semantic } from "../../utils/helper/semantic"

/**
 * The enforce conventions configuration
 */

export type Column = string | number
export interface EnforceConventions {
	/**
	 * The columns to enforce conventions
	 */
	onColumn?: Column[]
	/**
	 * The comment to append to the header
	 */
	commentHeader?: string
	/**
	 * The comment to append to the footer
	 */
	commentFooter?: string
	/**
	 * The column to move if fails
	 */
	moveToColumn?: string
	/**
	 * The conventions to enforce
	 */
	condition: SharedConventionsConfig[]
}

export interface SharedConventionsConfig extends SharedConventionConditions {
	/**
	 * The failed comment to use
	 */
	failedComment: string
	/**
	 * The contexts to use. Use this in combernation with "semanticTitle"
	 * @requires conditions: "semanticTitle"
	 */
	contexts?: string[]
}

export async function enforce(this: Issues | PullRequests | Project) {
	if (
		!this.config.enforceConventions ||
		!this.config.enforceConventions.condition
	)
		throw new Error("No enforceable conventions")
	let required = 0,
		successful = 0,
		failedMessages: string[] = []
	// this.config.enforceConventions.conventions.forEach(async (convention) => {
	for (const convention of this.config.enforceConventions.condition) {
		if (!convention.condition) return
		required++
		if (convention.condition == "semanticTitle") {
			convention.requires = 1
			const conditions: Condition[] = []
			semantic.forEach((condition) => {
				conditions.push({
					type: "titleMatches",
					condition: `/^${condition}(\\(.*\\))?:/i`
				})
			})
			if (convention.contexts) {
				convention.requires = 2
				convention.contexts.forEach((condition) => {
					conditions.push({
						type: "titleMatches",
						condition: `/\\(.*${condition}.*\\):/i`
					})
				})
			}
			convention.failedComment =
				`Semantic Conditions failed - Please title your ${this.curContext.type == "pr" ? "pull request" : "issue"
				} using one of the valid options:\r\n\r\n Types: ` +
				semantic.join(", ") +
				(convention.contexts
					? `\r\n\r\n Contexts: ${convention.contexts.join(", ")}`
					: "")
			convention.condition = conditions
		}
		let success = await evaluator.call(this, convention, this.context.props)
		if (success) {
			successful++
		} else {
			failedMessages.push(convention.failedComment)
			log(
				LoggingLevels.info,
				convention.failedComment
			)
		}
	}

	if (required > successful) {
		failedMessages.forEach((fail) => core.setFailed(fail))
		let suffix = `\r\n\r\n----------\r\n\r\nThis message will be automatically updated when you make this change\r\n\r\n${this.config.enforceConventions.commentFooter || ""
			}`,
			body: string =
				`${this.config.enforceConventions.commentHeader || ""}\r\n\r\n` + failedMessages?.join("\r\n\r\n") + suffix
		this.createComment.call(this, "Conventions", false, { body })
		return false
	}
	log(
		LoggingLevels.info,
		`All conventions successfully enforced. Moving to next step`
	)
	this.createComment.call(this, "Conventions", true, { body: "All conventions successfully enforced." })
	return true
}