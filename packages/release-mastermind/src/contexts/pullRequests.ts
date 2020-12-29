import * as core from '@actions/core'
import { loggingData } from '@videndum/utilities'
import { log } from '..'
import { Config, PullRequestConfig, Release, Runners } from '../../types'
import { CurContext, PRContext } from '../conditions'
import { evaluator } from '../evaluator'
import { Utils } from '../utils'
import { Contexts } from './methods'

export class PullRequests extends Contexts {
  context: PRContext
  config: PullRequestConfig
  constructor(
    util: Utils,
    runners: Runners,
    configs: Config,
    curContext: CurContext,
    dryRun: boolean
  ) {
    if (curContext.type !== 'pr')
      throw new loggingData('500', 'Cannot construct without issue context')
    super(util, runners, configs, curContext, dryRun)
    this.context = curContext.context
    if (!configs.pr) throw new loggingData('500', 'Cannot start without config')
    this.config = configs.pr
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
        enforceConventionsSuccess = await this.conventions.enforce(this)
      if (enforceConventionsSuccess) {
        if (this.config.labels)
          await this.applyLabels(this).catch(err => {
            log(new loggingData('500', 'Error applying labels', err))
          })
        if (this.config.assignProject)
          await this.assignProject(this).catch(err => {
            log(new loggingData('500', 'Error assigning projects', err))
          })
        // if (this.config.automaticApprove)
        //   await this.automaticApprove(this.config.automaticApprove)
        // duplicate hotfix
        if (this.config.manageRelease)
          await this.bumpVersion(this.config.manageRelease.labels)
        // create changelog
        // create release
        // sync remote repositories
        // if (this.config.syncRemote) await this.syncRemoteRepo(this)
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
        this.newVersion = await this.util.versioning.parse(
          this.configs,
          this.config?.ref || this.context.ref
        )
        this.run(attempt)
      }, seconds * 1000)
    }
  }

  automaticApprove(automaticApprove: PullRequestConfig['automaticApprove']) {
    if (!automaticApprove || !automaticApprove.conventions)
      throw new loggingData('500', 'Not Able to automatically approve')
    automaticApprove.conventions.forEach(convention => {
      if (!convention.conditions) return
      if (evaluator.call(this, convention, this.context.props)) {
        log(new loggingData('200', `Automatically Approved Successfully`))
        let body =
          automaticApprove.commentHeader +
          '\n\n Automatically Approved - Will automatically merge shortly! \n\n' +
          automaticApprove.commentFooter
        this.util.api.pullRequests.reviews.create(
          this.context.IDNumber,
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
    if (!labels || !this.context.props.labels) return
    if (
      (this.configs.versioning.type == 'SemVer' ||
        this.configs.versioning == undefined) &&
      this.newVersion.semantic
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
          this.configs.prereleaseName ||
          'prerelease'
      }
      if (this.context.props.labels[labels.build]) {
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
