import * as core from '@actions/core'
import { GitHub } from '@actions/github'
import { log } from '..'
import {
  ConditionSetType,
  CurContext,
  evaluator,
  IssueContext,
  Version
} from '../conditions'
import { Config } from '../types'
import { addRemoveLabel, enforceConventions } from './utils'

export class Issues {
  private configs: Config
  private config: Config['pr']
  private curContext: CurContext
  private context: IssueContext
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
    if (curContext.type !== 'issue')
      throw new Error('Cannot construct without issue context')
    if (!configs) throw new Error('Cannot construct without configs')
    if (!configs.issue) throw new Error('Cannot construct without PR config')
    if (!curContext) throw new Error('Cannot construct without context')
    this.client = client
    this.repo = repo
    this.configs = configs
    this.config = configs.issue
    this.curContext = curContext
    this.context = curContext.context
    this.newVersion = curContext.context.currentVersion
    this.dryRun = dryRun
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
          { client: this.client, repo: this.repo },
          this.config.enforceConventions,
          this.curContext,
          this.dryRun
        )
      if (enforceConventionsSuccess) {
        if (this.config.labels) await this.applyLabels(this.dryRun)
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

  /**
   * Apply Labels to Issues
   * @author IvanFon, TGTGamer, jbinda
   * @since 1.0.0
   */
  async applyLabels(dryRun: boolean) {
    if (!this.config?.labels || !this.configs.labels)
      throw new Error('Config is required to add labels')
    const { labels: curLabels, issueProps, IDNumber } = this.context
    for (const [labelID, conditionsConfig] of Object.entries(
      this.config.labels
    )) {
      log(`Label: ${labelID}`, 1)

      const shouldHaveLabel = evaluator(
        ConditionSetType.issue,
        conditionsConfig,
        issueProps
      )

      await addRemoveLabel({
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
}
