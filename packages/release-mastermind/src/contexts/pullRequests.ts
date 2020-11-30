import * as core from '@actions/core'
import { GitHub } from '@actions/github'
import { log } from '..'
import { api } from '../api'
import { CurContext, PRContext, Version } from '../conditions'
import { ConditionSetType, evaluator } from '../evaluator'
import { Config, PullRequestConfig, Release } from '../types'
import { utils } from '../utils'
import { addRemove } from '../utils/labels'
import * as methods from './methods'

export class PullRequests {
  private configs: Config
  private config: Config['pr']
  private curContext: CurContext
  private context: PRContext
  private newVersion: Version = {}
  private client: GitHub
  private repo: { owner: string; repo: string }
  private dryRun: boolean

  constructor(
    client: GitHub,
    repo: { owner: string; repo: string },
    configs: Config,
    curContext: CurContext,
    dryRun: boolean
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
    this.dryRun = dryRun
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
        enforceConventionsSuccess = await methods.enforce(
          { client: this.client, repo: this.repo },
          this.config,
          this.curContext,
          this.dryRun
        )
      if (enforceConventionsSuccess) {
        if (this.config.labels) await this.applyLabels(this.dryRun)
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
        this.newVersion = await utils.versioning.parse(
          { client: this.client, repo: this.repo },
          this.configs,
          this.config?.ref || this.context.ref
        )
        this.run(attempt)
      }, seconds * 1000)
    }
  }

  /**
   * Apply Labels to Pull Requests
   * @author IvanFon, TGTGamer, jbinda
   * @since 1.0.0
   */
  async applyLabels(dryRun: boolean) {
    if (!this.config?.labels || !this.configs.labels)
      throw new Error('Config is required to add labels')
    const { labels: curLabels, prProps, IDNumber } = this.context
    for (const [labelID, conditionsConfig] of Object.entries(
      this.config.labels
    )) {
      log(`Label: ${labelID}`, 1)

      const shouldHaveLabel = evaluator(
        ConditionSetType.pr,
        conditionsConfig,
        prProps
      )

      await addRemove({
        client: this.client,
        curLabels,
        labelID,
        labelName: this.configs.labels[labelID],
        IDNumber,
        repo: this.repo,
        shouldHaveLabel,
        dryRun
      }).catch(err => {
        log(`Error thrown while running addRemoveLabel: ` + err, 5)
      })
    }
  }

  automaticApprove(automaticApprove: PullRequestConfig['automaticApprove']) {
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

  bumpVersion(labels: Release['labels']) {
    if (!labels || !this.context.labels) return
    if (
      (this.configs.versioning == 'SemVer' ||
        this.configs.versioning == undefined) &&
      this.newVersion.semantic
    ) {
      if (
        this.context.labels[labels.major] || labels.breaking
          ? this.context.labels[labels.major]
          : true
      ) {
        this.newVersion.semantic.major++
      } else if (this.context.labels[labels.minor]) {
        this.newVersion.semantic.minor++
      } else if (this.context.labels[labels.patch]) {
        this.newVersion.semantic.patch++
      }
      if (this.context.labels[labels.prerelease]) {
        this.newVersion.semantic.prerelease =
          this.newVersion.semantic.prerelease ||
          this.configs.prereleaseName ||
          'prerelease'
      }
      if (this.context.labels[labels.build]) {
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
