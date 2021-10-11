/** @format */

import { Utils } from ".."
import { Label, Labels } from "../../action"

export async function add(this: Utils, IDNumber: number, label: string) {
	if (!this.dryRun)
		await this.client.rest.issues.addLabels({
			...this.repo,
			issue_number: IDNumber,
			labels: [label]
		})
}
export async function create(this: Utils, label: Label, ref?: string) {
	const color = await this.parsingData.formatColor(label.color)
	if (!this.dryRun)
		await this.client.rest.issues.createLabel({
			...this.repo,
			ref: ref || this.ref || "master",
			...label,
			color
		})
}

export async function del(this: Utils, name: string, ref?: string) {
	if (!this.dryRun)
		await this.client.rest.issues.deleteLabel({
			...this.repo,
			ref: ref || this.ref || "master",
			name
		})
}

export async function get(this: Utils, ref?: string): Promise<Labels> {
	const labels = await this.client.paginate(
		this.client.rest.issues.listLabelsForRepo.endpoint({
			...this.repo,
			ref: ref || this.ref || "master"
		})
	)

	const labelsMap = labels.map((label: any) => ({
		name: label.name,
		description: label.description != null ? label.description : undefined,
		color: label.color
	}))

	return labelsMap.reduce((acc: { [key: string]: Label }, cur) => {
		acc[cur.name.toLowerCase()] = cur
		return acc
	}, {})
}

export async function remove(
	this: Utils,
	IDNumber: number,
	label: string,
	ref?: string
) {
	if (!this.dryRun)
		await this.client.rest.issues.removeLabel({
			...this.repo,
			ref: ref || this.ref || "master",
			issue_number: IDNumber,
			name: label
		})
}

export async function update(
	this: Utils,
	current_name: string,
	label: Label,
	ref?: string
) {
	const color = await this.parsingData.formatColor(label.color)
	if (!this.dryRun)
		await this.client.rest.issues.updateLabel({
			...this.repo,
			ref: ref || this.ref || "master",
			current_name,
			name: label.name,
			description: label.description,
			color
		})
}
