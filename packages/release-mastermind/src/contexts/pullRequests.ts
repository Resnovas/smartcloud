import * as core from '@actions/core'
import { GitHub } from '@actions/github'
import { loggingData } from '@videndum/utilities'
import { log } from '..'
import { api } from '../api'
import { CurContext, PRContext, Version } from '../conditions'
import { ConditionSetType, evaluator } from '../evaluator'
import { Config, PullRequestConfig, Release, Runners } from '../types'
import { utils } from '../utils'
import { addRemove } from '../utils/labels'
import * as methods from './methods'

export class PullRequests {
  private runners: Runners
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
    runners: Runners,
    configs: Config,
    curContext: CurContext,
    dryRun: boolean
  ) {
    if (curContext.type !== 'pr')
      throw new Error('Cannot construct without PR context')
    if (!runners) throw new Error('Cannot construct without configs')
    if (!configs) throw new Error('Cannot construct without configs')
    if (!configs.pr) throw new Error('Cannot construct without PR config')
    if (!curContext) throw new Error('Cannot construct without context')
    this.client = client
    this.repo = repo
    this.runners = runners
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
        core.endGroup()
        throw log(
          new loggingData(
            '800',
            `Pull Request actions failed. Terminating job.`
          )
        )
      }
      log(
        new loggingData(
          '400',
          `Pull Request Actions failed with "${err}", retrying in ${seconds} seconds....`
        )
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
      throw new loggingData('500', 'Config is required to add labels')
    const { prProps, IDNumber } = this.context
    for (const [labelID, conditionsConfig] of Object.entries(
      this.config.labels
    )) {
      log(new loggingData('100', `Label: ${labelID}`))

      const shouldHaveLabel = evaluator(
        ConditionSetType.pr,
        conditionsConfig,
        prProps
      )

      const labelName = this.configs.labels[labelID]
      if (!labelName)
        throw new loggingData(
          '500',
          `Can't find configuration for ${labelID} within labels. Check spelling and that it exists`
        )
      const hasLabel = Boolean(
        this.context.prProps.labels?.[labelName.toLowerCase()]
      )
      if (!shouldHaveLabel && hasLabel && this.context.prProps.labels)
        delete this.context.prProps.labels[labelName.toLowerCase()]
      if (
        shouldHaveLabel &&
        !hasLabel &&
        this.context.prProps.labels &&
        this.runners.labels
      )
        this.context.prProps.labels[
          labelName.toLowerCase()
        ] = this.runners.labels[labelID]

      await addRemove({
        client: this.client,
        curLabels: this.context.prProps.labels,
        labelID,
        labelName,
        hasLabel,
        IDNumber,
        repo: this.repo,
        shouldHaveLabel,
        dryRun
      }).catch(err => {
        log(
          new loggingData(
            '500',
            `Error thrown while running addRemoveLabel: ` + err
          )
        )
      })
    }
  }

  automaticApprove(automaticApprove: PullRequestConfig['automaticApprove']) {
    if (!automaticApprove || !automaticApprove.conventions)
      throw new loggingData('500', 'Not Able to automatically approve')
    automaticApprove.conventions.forEach(convention => {
      if (!convention.conditions) return
      if (evaluator(ConditionSetType.pr, convention, this.context.prProps)) {
        log(new loggingData('200', `Automatically Approved Successfully`))
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
    if (!labels || !this.context.prProps.labels) return
    if (
      (this.configs.versioning == 'SemVer' ||
        this.configs.versioning == undefined) &&
      this.newVersion.semantic
    ) {
      if (
        this.context.prProps.labels[labels.major] || labels.breaking
          ? this.context.prProps.labels[labels.major]
          : true
      ) {
        this.newVersion.semantic.major++
      } else if (this.context.prProps.labels[labels.minor]) {
        this.newVersion.semantic.minor++
      } else if (this.context.prProps.labels[labels.patch]) {
        this.newVersion.semantic.patch++
      }
      if (this.context.prProps.labels[labels.prerelease]) {
        this.newVersion.semantic.prerelease =
          this.newVersion.semantic.prerelease ||
          this.configs.prereleaseName ||
          'prerelease'
      }
      if (this.context.prProps.labels[labels.build]) {
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
      log(new loggingData('100', `New Version is: ${this.newVersion.name}`))
    }
  }
}
