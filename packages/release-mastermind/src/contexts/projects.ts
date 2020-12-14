import * as core from '@actions/core'
import { GitHub } from '@actions/github'
import { loggingData } from '@videndum/utilities'
import { log } from '..'
import { Column, Config, ProjectConfig, Runners } from '../../types'
import { api } from '../api'
import { CurContext, ProjectContext } from '../conditions'
import { Contexts } from './methods'
export class Project extends Contexts {
  context: ProjectContext
  config: ProjectConfig
  constructor(
    client: GitHub,
    repo: { owner: string; repo: string },
    runners: Runners,
    configs: Config,
    curContext: CurContext,
    dryRun: boolean
  ) {
    if (curContext.type !== 'project')
      throw new loggingData('500', 'Cannot construct without issue context')
    super(client, repo, runners, configs, curContext, dryRun)
    this.context = curContext.context
    if (!configs.project)
      throw new loggingData('500', 'Cannot start without config')
    this.config = configs.project
  }

  async run(attempt?: number) {
    if (!this.config)
      throw new loggingData('500', 'Cannot start without config')
    if (!attempt) {
      attempt = 1
      core.startGroup('project Actions')
    }
    let seconds = attempt * 10,
      enforceConventionsSuccess: boolean = true

    try {
      if (this.config.enforceConventions) {
        if (!this.config.enforceConventions.onColumn) return
        this.config.enforceConventions.onColumn = await this.convertColumnStringsToIDArray(
          this.config.enforceConventions.onColumn
        )
        if (
          this.config.enforceConventions?.onColumn?.includes(
            this.context.props.column_id
          )
        )
          enforceConventionsSuccess = await this.conventions.enforce(this)
      }
      if (enforceConventionsSuccess) {
        // some code
        if (this.config.labels) await this.applyLabels(this)
        if (this.config.syncRemote)
          await this.syncRemoteProject(this).catch(err => {
            log(new loggingData('500', 'Error syncing remote', err))
          })
        core.endGroup()
      }
    } catch (err) {
      if (attempt > 3) {
        core.endGroup()
        throw log(
          new loggingData('800', `project actions failed. Terminating job.`)
        )
      }
      log(
        new loggingData(
          '400',
          `project Actions failed with "${err}", retrying in ${seconds} seconds....`
        )
      )
      attempt++
      setTimeout(async () => {
        this.run(attempt)
      }, seconds * 1000)
    }
  }
  async convertColumnStringsToIDArray(columns: Column[]): Promise<number[]> {
    const columnList = await api.project.column.list(
      { client: this.client, repo: this.repo },
      this.context.props.project.id
    )
    return await columns.map(column => {
      if (typeof column === 'string') {
        let columnID: number | undefined
        columnList.forEach(value => {
          if (value.name.toLowerCase() == column.toLowerCase())
            columnID = value.id
        })
        if (!columnID)
          throw new loggingData(
            '500',
            `${column} doesn't exist on this project`
          )
        return columnID
      } else return column
    })
  }
}
