import * as core from '@actions/core'
import { GitHub } from '@actions/github'
import { log } from '..'
import { Config, IssueContext } from '../types'
import { enforceConventions } from './utils'

export class Issues {
  private configs: Config
  private config: Config['issue']
  private context: IssueContext
  private client: GitHub
  private repo: { owner: string; repo: string }

  constructor(
    client: GitHub,
    repo: { owner: string; repo: string },
    configs: Config,
    curContext: IssueContext
  ) {
    if (!configs) throw new Error('Cannot construct without configs')
    if (!configs.issue) throw new Error('Cannot construct without Issue config')
    if (!curContext) throw new Error('Cannot construct without context')
    this.client = client
    this.repo = repo
    this.configs = configs
    this.config = configs.issue
    this.context = curContext
  }

  async run(attempt?: number) {
    if (!this.config) throw new Error('Cannot start without config')
    if (!attempt) {
      attempt = 1
      core.startGroup('Issue Actions')
    }
    let seconds = attempt * 10,
      enforceConventionsSuccess: boolean = true
    try {
      if (this.config.enforceConventions)
        enforceConventionsSuccess = await enforceConventions(
          'pr',
          this.config.enforceConventions,
          this.context
        )
      if (enforceConventionsSuccess) {
        // some code
        core.endGroup()
      }
    } catch (err) {
      if (attempt > 3) {
        log(`Issue actions failed. Terminating job.`, 8)
        core.endGroup()
        throw new Error(`Issue actions failed. Terminating job.`)
      }
      log(
        `Issue Actions failed with "${err}", retrying in ${seconds} seconds....`,
        4
      )
      attempt++
      setTimeout(async () => {
        this.run(attempt)
      }, seconds * 1000)
    }
  }
}
