import * as core from '@actions/core'
import { GitHub } from '@actions/github'
import { loggingData } from '@videndum/utilities'
import { log } from '..'
import { CurContext, IssueContext, Version } from '../conditions'
import { ConditionSetType, evaluator } from '../evaluator'
import { Config, Runners } from '../types'
import { utils } from '../utils'
import * as methods from './methods'
export class Issues {
  private runners: Runners
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
    runners: Runners,
    configs: Config,
    curContext: CurContext,
    dryRun: boolean
  ) {
    if (curContext.type !== 'issue')
      throw new loggingData('500', 'Cannot construct without issue context')
    if (!runners)
      throw new loggingData('500', 'Cannot construct without configs')
    if (!configs)
      throw new loggingData('500', 'Cannot construct without configs')
    if (!configs.issue)
      throw new loggingData('500', 'Cannot construct without PR config')
    if (!curContext)
      throw new loggingData('500', 'Cannot construct without context')
    this.client = client
    this.repo = repo
    this.runners = runners
    this.configs = configs
    this.config = configs.issue
    this.curContext = curContext
    this.context = curContext.context
    this.newVersion = curContext.context.currentVersion
    this.dryRun = dryRun
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
        enforceConventionsSuccess = await methods.enforce(
          { client: this.client, repo: this.repo },
          this.config,
          this.curContext,
          this.dryRun
        )
      if (enforceConventionsSuccess) {
        if (this.config.labels) await this.applyLabels(this.dryRun)
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

  /**
   * Apply Labels to Issues
   * @author IvanFon, TGTGamer, jbinda
   * @since 1.0.0
   */
  async applyLabels(dryRun: boolean) {
    if (!this.config?.labels || !this.configs.labels)
      throw new loggingData('500', 'Config is required to add labels')
    const { issueProps, IDNumber } = this.context
    for (const [labelID, conditionsConfig] of Object.entries(
      this.config.labels
    )) {
      log(new loggingData('100', `Label: ${labelID}`))

      const shouldHaveLabel = evaluator(
        ConditionSetType.issue,
        conditionsConfig,
        issueProps
      )
      const labelName = this.configs.labels[labelID]
      if (!labelName)
        throw new loggingData(
          '500',
          `Can't find configuration for ${labelID} within labels. Check spelling and that it exists`
        )
      const hasLabel = Boolean(
        this.context.issueProps.labels?.[labelName.toLowerCase()]
      )
      if (!shouldHaveLabel && hasLabel && this.context.issueProps.labels)
        delete this.context.issueProps.labels[labelName.toLowerCase()]
      if (
        shouldHaveLabel &&
        !hasLabel &&
        this.context.issueProps.labels &&
        this.runners.labels
      )
        this.context.issueProps.labels[
          labelName.toLowerCase()
        ] = this.runners.labels[labelID]

      await utils.labels
        .addRemove({
          client: this.client,
          curLabels: this.context.issueProps.labels,
          labelID,
          labelName,
          IDNumber,
          hasLabel,
          repo: this.repo,
          shouldHaveLabel,
          dryRun
        })
        .catch(err => {
          log(
            new loggingData(
              '500',
              `Error thrown while running addRemoveLabel: ` + err
            )
          )
        })
    }
  }
}
