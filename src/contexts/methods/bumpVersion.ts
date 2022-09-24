/** @format */

import { LoggingLevels } from "@resnovas/utilities"
import { PullRequests } from ".."
import { log } from "../.."

export async function bumpVersion(this: PullRequests) {
    const labels = this.config.manageRelease?.labels
    if (!labels || !this.context.props.labels) return
    if (
        (!this.configs.versioning || this.configs.versioning.type == "SemVer") &&
        this.newVersion?.semantic
    ) {
        if (
            this.context.props.labels[labels.major] || labels.breaking
                ? this.context.props.labels[labels.major]
                : true
        ) {
            this.newVersion.semantic.major++
        } else if (this.context.props.labels[labels.minor]) {
            this.newVersion.semantic.minor++
        } else if (this.context.props.labels[labels.patch]) {
            this.newVersion.semantic.patch++
        }
        if (this.context.props.labels[labels.prerelease]) {
            this.newVersion.semantic.prerelease =
                this.newVersion.semantic.prerelease ||
                this.configs.versioning?.prereleaseName ||
                "prerelease"
        }
        if (this.context.props.labels[labels.build]) {
            this.newVersion.semantic.build = +1
        }
        this.newVersion.name = `${this.newVersion.semantic.major}.${this.newVersion.semantic.minor
            }.${this.newVersion.semantic.patch}${this.newVersion.semantic.prerelease
                ? `-${this.newVersion.semantic.prerelease}`
                : ""
            }${this.newVersion.semantic.build
                ? `+${this.newVersion.semantic.build}`
                : ""
            }`
        log(LoggingLevels.debug, `New Version is: ${this.newVersion.name}`)
    }
}