import * as core from '@actions/core'
import { log } from '..'
import { LoggingDataClass, LoggingLevels } from '@videndum/utilities'
import { Column, Config, ProjectConfig, Runners } from '../../types'
import { CurContext, ProjectContext } from '../conditions'
import { Utils } from '../utils'
import { Contexts } from './methods'
export class Project extends Contexts {
  context: ProjectContext
  config: ProjectConfig
  constructor(
    util: Utils,
    runners: Runners,
    configs: Config,
    curContext: CurContext,
    dryRun: boolean
  ) {
    if (curContext.type !== 'project')
      throw new LoggingDataClass(LoggingLevels.error, 'Cannot construct without issue context')
    super(util, runners, configs, curContext, dryRun)
    this.context = curContext.context
    if (!configs.project)
      throw new LoggingDataClass(LoggingLevels.error, 'Cannot start without config')
    this.config = configs.project
  }

  async run(attempt?: number) {
    if (!this.config)
      throw new LoggingDataClass(LoggingLevels.error, 'Cannot start without config')
    if (!attempt) {
      attempt = 1
      core.startGroup('project Actions')
    }
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
        if (this.config.labels)
          await this.applyLabels(this).catch(err => {
            log(LoggingLevels.error, 'Error applying labels', err)
          })
        if (this.config.syncRemote)
          await this.syncRemoteProject(this).catch(err => {
            log(LoggingLevels.error, 'Error syncing remote project', err)
          })
        core.endGroup()
      }
    } catch (err) {
      if (attempt > 3) {
        core.endGroup()
        throw log(
          LoggingLevels.emergency, `project actions failed. Terminating job.`)
        
      }
      log(
        
          LoggingLevels.warn,
          `project Actions failed with "${err}", retrying in ${seconds} seconds....`
        )
      
      attempt++
      setTimeout(async () => {
        this.run(attempt)
      }, seconds * 1000)
    }
  }
  async convertColumnStringsToIDArray(columns: Column[]): Promise<number[]> {
    const columnList = await this.util.api.project.column.list(
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
          throw new LoggingDataClass(
            LoggingLevels.error,
            `${column} doesn't exist on this project`
          )
        return columnID
      } else return column
    })
  }
}
