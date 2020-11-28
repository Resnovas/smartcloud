import * as core from '@actions/core'
import { GitHub } from '@actions/github'
import { log } from '..'
import { api } from '../api'
import evaluator, { ConditionSetType } from '../conditions/evaluator'
import {
  Config,
  CurContext,
  PRContext,
  pullRequestConfig,
  release,
  version
} from '../types'
import { utils } from '../utils'
import { enforceConventions } from './utils'

export class PullRequests {
  private configs: Config
  private config: Config['pr']
  private curContext: CurContext
  private context: PRContext
  private newVersion: version = {}
  private client: GitHub
  private repo: { owner: string; repo: string }

  constructor(
    client: GitHub,
    repo: { owner: string; repo: string },
    configs: Config,
    curContext: CurContext
  ) {
    if (curContext.type !== 'pr')
      throw new Error('Cannot construct without PR context')
    if (!configs) throw new Error('Cannot construct without configs')
    if (!configs.pr) throw new Error('Cannot construct without PR config')
    if (!curContext) throw new Error('Cannot construct without context')
    this.client = client
    this.repo = repo
    this.configs = configs
    this.config = configs.pr
    this.curContext = curContext
    this.context = curContext.context
    this.newVersion = curContext.context.currentVersion
  }

  async run(attempt?: number) {
    if (!this.config) throw new Error('Cannot start without config')
    if (!attempt) {
      attempt = 1
      core.startGroup('Pull Request Actions')
    }
    let seconds = attempt * 10,
      enforceConventionsSuccess: boolean = true
    try {
      if (this.config.enforceConventions)
        enforceConventionsSuccess = await enforceConventions(
          { client: this.client, repo: this.repo },
          this.config.enforceConventions,
          this.curContext
        )
      if (enforceConventionsSuccess) {
        // if (this.config.automaticApprove)
        //   await this.automaticApprove(this.config.automaticApprove)
        // duplicate hotfix
        if (this.config.manageRelease)
          await this.bumpVersion(this.config.manageRelease.labels)
        // create changelog
        // create release
        // sync remote repositories
        core.endGroup()
      }
    } catch (err) {
      if (attempt > 3) {
        log(`Pull Request actions failed. Terminating job.`, 8)
        core.endGroup()
        throw new Error(`Pull Request actions failed. Terminating job.`)
      }
      log(
        `Pull Request Actions failed with "${err}", retrying in ${seconds} seconds....`,
        4
      )
      attempt++
      setTimeout(async () => {
        this.newVersion = await utils.parseVersion(
          { client: this.client, repo: this.repo },
          this.configs,
          this.config?.ref || this.context.ref
        )
        this.run(attempt)
      }, seconds * 1000)
    }
  }

  automaticApprove(automaticApprove: pullRequestConfig['automaticApprove']) {
    if (!automaticApprove || !automaticApprove.conventions)
      throw new Error('Not Able to automatically approve')
    automaticApprove.conventions.forEach(convention => {
      if (!convention.conditions) return
      if (evaluator(ConditionSetType.pr, convention, this.context.prProps)) {
        log(`Automatically Approved Successfully`, 2)
        let body =
          automaticApprove.commentHeader +
          '\n\n Automatically Approved - Will automatically merge shortly! \n\n' +
          automaticApprove.commentFooter
        api.pullRequests.reviews.create(
          {
            client: this.client,
            IDNumber: this.context.IDNumber,
            repo: this.repo
          },
          body,
          'APPROVE'
        )
        return true
      } else {
        core.setFailed(convention.failedComment)
        return false
      }
    })
  }

  bumpVersion(labels: release['labels']) {
    if (!labels) return
    if (
      (this.configs.versioning == 'SemVer' ||
        this.configs.versioning == undefined) &&
      this.newVersion.semantic
    ) {
      if (
        this.context.labels.indexOf(labels.major) !== -1 || labels.breaking
          ? this.context.labels.indexOf(labels.major) !== -1
          : true
      ) {
        this.newVersion.semantic.major++
      } else if (this.context.labels.indexOf(labels.minor) !== -1) {
        this.newVersion.semantic.minor++
      } else if (this.context.labels.indexOf(labels.patch) !== -1) {
        this.newVersion.semantic.patch++
      }
      if (this.context.labels.indexOf(labels.prerelease) !== -1) {
        this.newVersion.semantic.prerelease =
          this.newVersion.semantic.prerelease ||
          this.configs.prereleaseName ||
          'prerelease'
      }
      if (this.context.labels.indexOf(labels.build) !== -1) {
        this.newVersion.semantic.build = +1
      }
      this.newVersion.name = `${this.newVersion.semantic.major}.${
        this.newVersion.semantic.minor
      }.${this.newVersion.semantic.patch}${
        this.newVersion.semantic.prerelease
          ? `-${this.newVersion.semantic.prerelease}`
          : ''
      }${
        this.newVersion.semantic.build
          ? `+${this.newVersion.semantic.build}`
          : ''
      }`
      log(`New Version is: ${this.newVersion.name}`, 1)
    }
  }
}
