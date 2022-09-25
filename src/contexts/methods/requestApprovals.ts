/** @format */

import * as core from "@actions/core"
import { LoggingDataClass, LoggingLevels } from "@resnovas/utilities"
import { SharedConventionsConfig } from "."
import { PullRequests } from ".."
import { log } from "../.."
import { evaluator } from "../../evaluator"

export interface RequestApprovals {
	[group: string]: Group
}

interface Group {
	/**
	 * The reviewers to reques
	 */
	reviewers: string[]
	/**
	 * The comment to create
	 */
	comment?: {
		/**
		 * The comment to append to the header
		 */
		commentHeader?: string
		/**
		 * The comment to append to the footer
		 */
		commentBody?: string
		/**
		 * The comment to append to the footer
		 */
		commentFooter?: string
	}
	condition: SharedConventionsConfig[]
}

export async function requestApprovals(this: PullRequests) {
	log(LoggingLevels.info, `Starting to Request Approval`)
	const requestApprovals = this.config?.requestApprovals
	if (!requestApprovals)
		throw new LoggingDataClass(
			LoggingLevels.error,
			"Not Able to automatically request approval"
		)
	for (let group in requestApprovals) {
		let groupConfig = requestApprovals[group]
		if (!groupConfig || !groupConfig.condition || !groupConfig.reviewers)
			throw new LoggingDataClass(
				LoggingLevels.error,
				"Not Able to automatically request approval for group " + group
			)
		return groupConfig.condition.forEach(async (convention) => {
			if (!convention) return
			if (await evaluator.call(this, convention, this.context.props)) {
				log(LoggingLevels.info, `Automatically Requesting Approvers`)
				const body =
					(groupConfig?.comment?.commentHeader == undefined
						? ""
						: groupConfig?.comment?.commentHeader + "\n\n") +
					(groupConfig?.comment?.commentBody == undefined
						? "Automatically Requesting Approvers - Will automatically merge once approved! \n\n"
						: groupConfig?.comment?.commentBody + "\n\n") +
					(groupConfig?.comment?.commentFooter == undefined
						? ""
						: groupConfig?.comment?.commentFooter)
				await this.util.api.pullRequests.reviews
					.requestReviewers(this.context.props.ID, groupConfig!.reviewers)
					.catch((error) => {
						log(
							LoggingLevels.error,
							`Unable to automatically request approval`,
							error
						)
					})
				return await this.createComment
					.call(this, "Approvals", false, { event: "COMMENT", body })
					.catch((error) => {
						log(
							LoggingLevels.error,
							`Unable to automatically request approval`,
							error
						)
					})
			} else {
				core.setFailed(convention.failedComment)
				return false
			}
		})
	}
}
