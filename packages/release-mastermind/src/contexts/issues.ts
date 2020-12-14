import * as core from '@actions/core'
import { GitHub } from '@actions/github'
import { loggingData } from '@videndum/utilities'
import { log } from '..'
import { Config, IssueConfig, Runners } from '../../types'
import { CurContext, IssueContext } from '../conditions'
import { Contexts } from './methods'
export class Issues extends Contexts {
  context: IssueContext
  config: IssueConfig
  constructor(
    client: GitHub,
    repo: { owner: string; repo: string },
    runners: Runners,
    configs: Config,
    curContext: CurContext,
    dryRun: boolean
  ) {
    if (curContext.type !== 'issue')
      throw new loggingData('500', 'Cannot construct without issue context')
    super(client, repo, runners, configs, curContext, dryRun)
    this.context = curContext.context
    this.config = super.config as IssueConfig
  }

  async run(attempt?: number) {
    if (!this.config)
      throw new loggingData('500', 'Cannot start without config')
    if (!attempt) {
      attempt = 1
      core.startGroup('Issue Actions')
    }
    let seconds = attempt * 10,
      enforceConventionsSuccess: boolean = true
    try {
      if (this.config.enforceConventions)
        enforceConventionsSuccess = await this.conventions.enforce()
      if (enforceConventionsSuccess) {
        if (this.config.labels) await this.applyLabels()
        if (this.config.assignProject && this.context.action == 'opened')
          await this.assignProject(this)
        core.endGroup()
      }
    } catch (err) {
      if (attempt > 3) {
        core.endGroup()
        throw new loggingData('800', `Issue actions failed. Terminating job.`)
      }
      log(
        new loggingData(
          '400',
          `Issue Actions failed with "${err}", retrying in ${seconds} seconds....`
        )
      )
      attempt++
      setTimeout(async () => {
        this.run(attempt)
      }, seconds * 1000)
    }
  }
}
