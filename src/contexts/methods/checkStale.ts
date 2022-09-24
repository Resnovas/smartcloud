/** @format */

import { LoggingLevels } from "@resnovas/utilities"
import { Issues, Project, PullRequests, Schedule } from ".."
import { log } from "../.."
import { SharedConditions } from "../../conditions"
import { evaluator } from "../../evaluator"

/**
 * The stale configuration
 */
export interface Stale {
	/**
	 * The label to use for stale issues
	 */
	staleLabel: string
	/**
	 * The stale configuration to use
	 */
	stale?: StaleConfig
	/**
	 * The abanonded configuration to use
	 */
	abandoned?: AbanondedConfig
	/**
	 * The conditions to use when checking stale
	 */
	condition?: SharedConditions[]
}

/**
 * The stale configuration
 */
export interface StaleConfig extends SharedConditions {
	/**
	 * The days to consider stale
	 */
	days: number
	/**
	 * The comment to append to the stale issue
	 */
	comment?: string
	/**
	 * The comment to switch when resolved
	 */
	resolve?: string
	/**
	 * The comment to append to the header
	 */
	commentHeader?: string
	/**
	 * The comment to append to the footer
	 */
	commentFooter?: string
}

/**
 * The abanonded configuration
 */
export interface AbanondedConfig extends StaleConfig {
	/**
	 * Should the abanonded issue be closed
	 */
	close?: boolean
	/**
	 * Should the abanonded issue be locked
	 */
	lock?: boolean
	/**
	 * The label to use for abanonded issues
	 */
	label: string
}

export async function checkStale(
	this: Issues | PullRequests | Project | Schedule
) {
	const config = this.config.stale
	if (!config) throw new Error("Stale is not enabled")
	if (!this.context.props) throw new Error("Context Props must exist")
	const StaleLabel = this.configs.labels?.[config.staleLabel]
	if (!StaleLabel) throw new Error("Stale Label must exist")
	let suffix = `\r\n\r\n----------\r\n\r\nSimply comment, assign or modify this issue to remove the stale status \r\n\r\n`

	if (config.stale) {
		log(
			LoggingLevels.debug,
			`Checking stale status for ${this.context.props.type} ${this.context.props.ID} - ${this.context.props.title}`
		)
		if (
			!config.stale.condition?.find(
				(condition) => condition.type === "isStale"
			)
		) {
			if (!config.stale.condition)
				config.stale.condition = [
					{ type: "isStale", condition: config.stale.days }
				]
			else
				config.stale.condition.push({
					type: "isStale",
					condition: config.stale.days
				})

			if (!config.stale.requires) config.stale.requires = 1
			else config.stale.requires++
		}

		// Check to see if the issue is stale using the evaluation function
		const stale = evaluator.call(this, config.stale, this.context.props)
		log(
			LoggingLevels.notice,
			`Stale status for ${this.context.props.title}: ${stale}`
		)

		// If stale run the rest of the actions
		if (await stale)
			if (this.config.labels && !this.config.labels[StaleLabel])
				// Apply the stale label
				this.config.labels[StaleLabel] = {
					condition: config.stale.condition,
					requires: 1
				}

		// Create the stale comment
		let isstale = await stale
		!this.dryRun && this.createComment.call(this, "stale", isstale, {
			body: (isstale ? config.stale.comment : config.stale.resolve) +
				"\r\n\r\n" +
				suffix + config.stale.commentFooter || "",
		})
	}
	if (config.abandoned) {
		log(
			LoggingLevels.debug,
			`Checking abandoned status for ${this.context.props.type} ${this.context.props.ID} - ${this.context.props.title}`
		)
		if (
			!config.abandoned.condition?.find(
				(condition) => condition.type === "isAbandoned"
			)
		) {
			if (!config.abandoned.condition)
				config.abandoned.condition = [
					{
						type: "isAbandoned",
						condition: config.abandoned.days,
						label: config.abandoned.label
					}
				]
			else
				config.abandoned.condition.push({
					type: "isAbandoned",
					condition: config.abandoned.days,
					label: config.abandoned.label
				})

			if (!config.abandoned.requires) {
				config.abandoned.requires = 1
			} else {
				config.abandoned.requires++
			}
		}

		// Check to see if the issue is abandoned using the evaluation function
		const abandoned = evaluator.call(this, config.abandoned, this.context.props)
		log(
			LoggingLevels.notice,
			`Abandoned status for ${this.context.props.title}: ${abandoned}`
		)

		const AbandonedLabel = this.configs.labels?.[config.abandoned.label]
		if (!AbandonedLabel) throw new Error("Stale Label must exist")

		if ((await abandoned) && AbandonedLabel)
			if (this.config.labels && !this.config.labels[AbandonedLabel])
				// Apply the stale label
				this.config.labels[AbandonedLabel] = {
					condition: config.abandoned.condition,
					requires: 1
				}
		// Create the abandoned comment
		let isAbandoned = await abandoned
		!this.dryRun && this.createComment.call(this, "stale", isAbandoned, {
			body: (isAbandoned ? config.abandoned.comment : config.abandoned.resolve) +
				"\r\n\r\n" +
				suffix + config.abandoned.commentFooter || "",
		})
	}
}