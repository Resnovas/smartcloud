import * as core from '@actions/core'
import { GitHub } from '@actions/github'
import { loggingData } from '@videndum/utilities'
import { log } from '..'
import { api } from '../api'
import { CurContext, IssueContext, Version } from '../conditions'
import { ConditionSetType, evaluator } from '../evaluator'
import { Config, Runners } from '../types'
import { utils } from '../utils'
import * as methods from './methods'
export class Issues {
  private runners: Runners
  private configs: Config
  private config: Config['issue']
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
      throw new loggingData('500', 'Cannot construct without issue config')
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
        if (this.config.assignProject && this.context.action == 'opened')
          await this.assignProject(this.dryRun)
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
    const { props, IDNumber } = this.context
    for (const [labelID, conditionsConfig] of Object.entries(
      this.config.labels
    )) {
      log(new loggingData('100', `Label: ${labelID}`))

      const shouldHaveLabel = evaluator(
        ConditionSetType.issue,
        conditionsConfig,
        props
      )
      const labelName = this.configs.labels[labelID]
      if (!labelName)
        throw new loggingData(
          '500',
          `Can't find configuration for ${labelID} within labels. Check spelling and that it exists`
        )
      const hasLabel = Boolean(
        this.context.props.labels?.[labelName.toLowerCase()]
      )
      if (!shouldHaveLabel && hasLabel && this.context.props.labels)
        delete this.context.props.labels[labelName.toLowerCase()]
      if (
        shouldHaveLabel &&
        !hasLabel &&
        this.context.props.labels &&
        this.runners.labels
      )
        this.context.props.labels[
          labelName.toLowerCase()
        ] = this.runners.labels[labelID]

      await utils.labels
        .addRemove({
          client: this.client,
          curLabels: this.context.props.labels,
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

  async assignProject(dryRun: boolean) {
    if (!this.config?.assignProject) return
    this.config.assignProject.forEach(async remote => {
      // Get projects
      let projects
      if (remote.user)
        projects = await api.project.projects.user(
          { client: this.client, repo: this.repo },
          remote.user
        )
      else if (remote.owner && !remote.repo)
        projects = await api.project.projects.org(
          { client: this.client, repo: this.repo },
          remote.owner
        )
      else if (remote.owner && remote.repo)
        projects = await api.project.projects.repo(
          { client: this.client, repo: this.repo },
          remote.owner,
          remote.repo
        )
      else
        projects = await api.project.projects.repo(
          { client: this.client, repo: this.repo },
          this.repo.owner,
          this.repo.repo
        )
      // Get the column
      const project = projects.filter(
        project => project.name === remote.project
      )[0]
      if (!project) throw log(new loggingData('500', 'No project to use'))
      const columns = await api.project.column.list(
        { client: this.client, repo: this.repo },
        project.id
      )
      if (!columns) throw log(new loggingData('500', 'No columns to use'))
      const remoteColumn = columns.filter(
        column => column.name === remote.column
      )[0]
      if (!remoteColumn) throw log(new loggingData('500', 'No column to use'))

      const should =
        remote.conditions.length > 0
          ? evaluator(ConditionSetType.pr, remote, this.context.props)
          : true

      if (should) {
        log(new loggingData('100', `Adding to project ${project.name}`))
        !dryRun &&
          (await api.project.card
            .create(
              { client: this.client, repo: this.repo },
              this.context.IDNumber,
              remoteColumn.id,
              'Issue'
            )
            .catch(err => {
              log(
                new loggingData(
                  '500',
                  `New error thrown when attempting to add to project "${project.name}"`,
                  err
                )
              )
            }))
      }
    })
  }
}
