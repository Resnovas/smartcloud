import * as core from '@actions/core'
import { GitHub } from '@actions/github'
import { log } from '..'
import { api } from '../api'
import { Config, Column} from '../types'
import {CurContext, ProjectContext, Version } from '../conditions'
import { enforceConventions } from './utils'

export class Project {
  private configs: Config
  private config: Config['project']
  private curContext: CurContext
  private context: ProjectContext
  private newVersion: Version = {}
  private client: GitHub
  private repo: { owner: string; repo: string }

  constructor(
    client: GitHub,
    repo: { owner: string; repo: string },
    configs: Config,
    curContext: CurContext
  ) {
    if (curContext.type !== 'project')
      throw new Error('Cannot construct without issue context')
    if (!configs) throw new Error('Cannot construct without configs')
    if (!configs.project) throw new Error('Cannot construct without PR config')
    if (!curContext) throw new Error('Cannot construct without context')
    this.client = client
    this.repo = repo
    this.configs = configs
    this.config = configs.project
    this.curContext = curContext
    this.context = curContext.context
    this.newVersion = curContext.context.currentVersion
  }

  async run(attempt?: number) {
    if (!this.config) throw new Error('Cannot start without config')
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
            this.context.projectProps.column_id
          )
        )
          enforceConventionsSuccess = await enforceConventions(
            { client: this.client, repo: this.repo },
            this.config.enforceConventions,
            this.curContext
          )
      }
      if (enforceConventionsSuccess) {
        // some code
        core.endGroup()
      }
    } catch (err) {
      if (attempt > 3) {
        log(`project actions failed. Terminating job.`, 8)
        core.endGroup()
        throw new Error(`project actions failed. Terminating job.`)
      }
      log(
        `project Actions failed with "${err}", retrying in ${seconds} seconds....`,
        4
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
      this.context.projectProps.project_id
    )
    return await columns.map(column => {
      if (typeof column === 'string') {
        let columnID: number | undefined
        columnList.forEach(value => {
          if (value.name.toLowerCase() == column.toLowerCase())
            columnID = value.id
        })
        if (!columnID)
          throw new Error(`${column} doesn't exist on this project`)
        return columnID
      } else return column
    })
  }
}
