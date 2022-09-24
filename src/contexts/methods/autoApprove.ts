/** @format */
import { SharedConventionsConfig } from "./conventions"

/**
 * Automatic Approval configuration
 */
export interface AutomaticApprove {
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
	/**
	 * The conventions to use when approving
	 */
	condition: SharedConventionsConfig[]
}

/** @format */

import * as core from "@actions/core"
import { LoggingDataClass, LoggingLevels } from "@resnovas/utilities"
import { PullRequests } from ".."
import { log } from "../.."
import { evaluator } from "../../evaluator"

export async function automaticApprove(this: PullRequests) {
	log(LoggingLevels.info, `Starting Automatic Approved`)
	const automaticApprove = this.config?.automaticApprove
	if (!automaticApprove || !automaticApprove.condition)
		throw new LoggingDataClass(
			LoggingLevels.error,
			"Not Able to automatically approve"
		)
	automaticApprove.condition.forEach(async (convention) => {
		if (!convention.condition) return
		if (await evaluator.call(this, convention, this.context.props)) {
			log(LoggingLevels.info, `Automatically Approved Successfully`)
			const body =
				(automaticApprove.commentHeader == undefined ? "" : automaticApprove.commentHeader + "\n\n") +
				(automaticApprove.commentBody == undefined ? "Automatically Approved - Will automatically merge shortly! \n\n" : automaticApprove.commentBody + "\n\n") +
				(automaticApprove.commentFooter == undefined ? "" : automaticApprove.commentFooter)
			return this.createComment.call(this, "Automatic Approval", false, { event: "APPROVE", body }).catch((error) => {
				log(LoggingLevels.error, `Unable to automatically approving`, error)
			})
		} else {
			core.setFailed(convention.failedComment)
			return false
		}
	})
}