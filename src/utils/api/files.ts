/** @format */

import * as github from "@actions/github"
import { Utils } from ".."

export async function get(
	this: Utils,
	file: string,
	ref?: string
): Promise<string> {
	/**
	 * Checks to see if the settings file is valid
	 */
	const gotdata: any = await this.client.rest.repos.getContent({
		owner: this.repo.owner || github.context.repo.owner,
		repo: this.repo.repo || github.context.repo.repo,
		ref: ref || this.ref || "master",
		path: file
	})
	return Buffer.from(gotdata.data.content, gotdata.data.encoding).toString()
}

export async function list(this: Utils, IDNumber: number, ref?: string) {
	const files = await this.client.rest.pulls
		.listFiles({
			...this.repo,
			pull_number: IDNumber,
			per_page: 100,
			ref: ref || this.ref || "master"
		})
		.catch((err) => {
			console.log(err)
			throw new Error(err)
		})
	return files.data.map((file) => file.filename)
}
