/** @format */

import { Event } from "."
import { UtilThis } from "../conditions"

export function respond(
	this: UtilThis,
	success: boolean,
	event: Event = "REQUEST_CHANGES",
	previousComment?: number,
	body?: string
) {
	if (!this.curContext.context.props?.ID)
		throw new Error("ID value is required")
	if (!previousComment && success && event !== "APPROVE") return
	// No need to comment if there is no previous comment and the job is successful
	else if ((!previousComment && !success) || event == "APPROVE") {
		// does not have a previous comment || is not successful

		if (this.curContext.type == "pr")
			this.util.api.pullRequests.reviews.create(
				this.curContext.context.props.ID,
				body,
				event
			)
		else
			this.util.api.issues.comments.create(
				this.curContext.context.props.ID,
				body as string
			)
	} else if (previousComment && !success) {
		// has a previous comment & is not successful

		if (this.curContext.type == "pr")
			this.util.api.pullRequests.reviews.update(
				this.curContext.context.props.ID,
				previousComment,
				body as string
			)
		else this.util.api.issues.comments.update(previousComment, body as string)
	} else if (previousComment && success) {
		// has a previous comment & is successful
		if (this.curContext.type == "pr")
			this.util.api.pullRequests.reviews.dismiss(
				this.curContext.context.props.ID,
				previousComment,
				body as string
			)
		else this.util.api.issues.comments.delete(previousComment)
	}
}
