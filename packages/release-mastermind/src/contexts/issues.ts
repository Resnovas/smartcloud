import * as core from '@actions/core'
import { LoggingDataClass, LoggingLevels } from '@videndum/utilities'
import { log } from '..'
import { Config, IssueConfig, Runners } from '../../types'
import { CurContext, IssueContext } from '../conditions'
import { Utils } from '../utils'
import { Contexts } from './methods'
export class Issues extends Contexts {
  context: IssueContext
  config: IssueConfig
  constructor(
    util: Utils,
    runners: Runners,
    configs: Config,
    curContext: CurContext,
    dryRun: boolean
  ) {
    if (curContext.type !== 'issue')
      throw new LoggingDataClass(LoggingLevels.error, 'Cannot construct without issue context')
    super(util, runners, configs, curContext, dryRun)
    this.context = curContext.context
    if (!configs.issue)
      throw new LoggingDataClass(LoggingLevels.error, 'Cannot start without config')
    this.config = configs.issue
  }

  async run(attempt?: number) {
    if (!this.config)
      throw new LoggingDataClass(LoggingLevels.warn, 'Cannot start without config')
    if (!attempt) {
      attempt = 1
      core.startGroup('Issue Actions')
    }
    let seconds = attempt * 10,
      enforceConventionsSuccess: boolean = true
    try {
      if (this.config.enforceConventions)
        enforceConventionsSuccess = await this.conventions.enforce(this)
      if (enforceConventionsSuccess) {
        if (this.config.labels)
          await this.applyLabels(this).catch(err => {
            log(LoggingLevels.error, 'Error applying label', err)
          })
        if (this.config.assignProject)
          await this.assignProject(this).catch(err => {
            log(LoggingLevels.error, 'Error assigning projects', err)
          })
        core.endGroup()
      }
    } catch (err) {
      if (attempt > 3) {
        core.endGroup()
        throw new LoggingDataClass(LoggingLevels.emergency, `Issue actions failed. Terminating job.`)
      }
      log(
          LoggingLevels.warn,
          `Issue Actions failed with "${err}", retrying in ${seconds} seconds....`
      )
      attempt++
      setTimeout(async () => {
        this.run(attempt)
      }, seconds * 1000)
    }
  }
}
