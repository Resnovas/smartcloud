/** @format */

import { Utils } from ".."

export async function create(
	this: Utils,
	title: string,
	body: string,
	labels: string[],
	assignees: string[],
	milestone: string,
	ref?: string
) {
	return (
		await this.client.rest.issues.create({
			...this.repo,
			ref: ref || this.ref || "master",
			title,
			body,
			milestone,
			labels,
			assignees
		})
	).data
}

export async function get(this: Utils, IDNumber: number, ref?: string) {
	return (
		await this.client.rest.issues.get({
			...this.repo,
			ref: ref || this.ref || "master",
			issue_number: IDNumber
		})
	).data
}
export async function list(
	this: Utils,
	{
		state,
		sort,
		direction,
		page,
		ref
	}: {
		state?: "open" | "closed" | "all"
		sort?: "created" | "updated" | "comments"
		direction?: "asc" | "desc"
		page?: number
		ref?: string
	}
) {
	return (
		await this.client.rest.issues.listForRepo({
			...this.repo,
			ref: ref || this.ref || "master",
			state,
			sort,
			direction,
			page,
			per_page: 100
		})
	).data
}

export const comments = {
	async list(this: Utils, IDNumber: number, ref?: string) {
		return (
			await this.client.rest.issues.listComments({
				...this.repo,
				ref: ref || this.ref || "master",
				issue_number: IDNumber
			})
		).data
	},
	async get(this: Utils, comment_id: number, ref?: string) {
		return (
			await this.client.rest.issues.getComment({
				...this.repo,
				ref: ref || this.ref || "master",
				comment_id
			})
		).data
	},
	async create(this: Utils, IDNumber: number, body: string, ref?: string) {
		return (
			await this.client.rest.issues.createComment({
				...this.repo,
				ref: ref || this.ref || "master",
				issue_number: IDNumber,
				body
			})
		).data
	},
	async update(this: Utils, comment_id: number, body: string, ref?: string) {
		return (
			await this.client.rest.issues.updateComment({
				...this.repo,
				ref: ref || this.ref || "master",
				comment_id,
				body
			})
		).data
	},
	async delete(this: Utils, comment_id: number, ref?: string) {
		return (
			await this.client.rest.issues.deleteComment({
				...this.repo,
				ref: ref || this.ref || "master",
				comment_id
			})
		).data
	}
}
