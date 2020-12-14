import * as core from '@actions/core'
import { GitHub } from '@actions/github'
import { loggingData } from '@videndum/utilities'
import { log } from '..'
import { Column, Config, Runners } from '../../types'
import { api } from '../api'
import { CurContext, ProjectContext, Version } from '../conditions'
import { evaluator } from '../evaluator'
import { addRemove } from '../utils/labels'
import * as methods from './methods'
export class Project {
  private runners: Runners
  private configs: Config
  private config: Config['project']
  private curContext: CurContext
  private context: ProjectContext
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
    if (curContext.type !== 'project')
      throw new loggingData('500', 'Cannot construct without issue context')
    if (!runners) throw new Error('Cannot construct without configs')
    if (!configs)
      throw new loggingData('500', 'Cannot construct without configs')
    if (!configs.project)
      throw new loggingData('500', 'Cannot construct without PR config')
    if (!curContext)
      throw new loggingData('500', 'Cannot construct without context')
    this.client = client
    this.repo = repo
    this.runners = runners
    this.configs = configs
    this.config = configs.project
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
          enforceConventionsSuccess = await methods.enforce(
            { client: this.client, repo: this.repo },
            this.config,
            this.curContext,
            this.dryRun
          )
      }
      if (enforceConventionsSuccess) {
        // some code
        if (this.config.labels) await this.applyLabels(this.dryRun)
        if (this.config.syncRemote)
          await this.syncRemote().catch(err => {
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

  async applyLabels(dryRun: boolean) {
    if (!this.config?.labels || !this.configs.labels)
      throw new loggingData('500', 'Config is required to add labels')
    const { props } = this.context
    for (const [labelID, conditionsConfig] of Object.entries(
      this.config.labels
    )) {
      log(new loggingData('100', `Label: ${labelID}`))

      const shouldHaveLabel = evaluator(conditionsConfig, props)

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

      await addRemove({
        client: this.client,
        curLabels: this.context.props.labels,
        labelID,
        labelName,
        hasLabel,
        IDNumber: this.context.props.ID,
        repo: this.repo,
        shouldHaveLabel,
        dryRun
      }).catch(err => {
        log(
          new loggingData(
            '500',
            `Error thrown while running addRemoveLabel: ` + err
          )
        )
      })
    }
  }

  async syncRemote() {
    if (!this.config?.syncRemote) return
    this.config.syncRemote.forEach(async remote => {
      if (remote.localProject !== this.context.props.project.name) return
      let remoteColumn
      let oldRemoteColumn
      let oldLocalColumn: {
        name: any
        cards_url: string
        created_at: string
        id: number
        node_id: string
        project_url: string
        updated_at: string
        url: string
      }
      let remoteCard
      let projects = undefined

      if (!(remote.owner || remote.user) || !remote.project)
        new loggingData('500', 'There is not a remote to connect.')
      // Get projects
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
      if (!projects) throw log(new loggingData('500', 'No project to use'))
      // Get the column
      const project = projects.filter(
        project => project.name === remote.project
      )[0]
      const columns = await api.project.column.list(
        { client: this.client, repo: this.repo },
        project.id
      )
      if (!columns) throw log(new loggingData('500', 'No column to use'))
      remoteColumn = columns.filter(
        column => column.name === this.context.props.localColumn.name
      )[0]
      if (this.context.action !== 'created') {
        // Get the cards
        if (this.context.action == 'moved') {
          oldLocalColumn = await api.project.column.get(
            { client: this.client, repo: this.repo },
            this.context.props.changes.column_id.from
          )
          oldRemoteColumn = columns.filter(
            column => column.name === oldLocalColumn.name
          )[0]
          remoteCard = await api.project.column.listCards(
            { client: this.client, repo: this.repo },
            oldRemoteColumn.id
          )
        } else {
          remoteCard = await api.project.column.listCards(
            { client: this.client, repo: this.repo },
            remoteColumn.id
          )
        }
        remoteCard = remoteCard.filter(
          card => card.content_url === this.context.props.localCard.content_url
        )[0]
        if (!remoteCard)
          throw log(new loggingData('500', 'No remote card to use'))
      }
      if (this.context.action == 'created' || !remoteCard) {
        api.project.card.create(
          { client: this.client, repo: this.repo },
          this.context.IDNumber,
          remoteColumn.id,
          'Issue'
        )
      } else if (this.context.action == 'moved') {
        api.project.card
          .move(
            { client: this.client, repo: this.repo },
            remoteCard.id,
            remoteColumn.id
          )
          .catch(err => {
            throw new loggingData(
              '500',
              'Error while attempting to move card',
              err
            )
          })
        log(new loggingData('200', 'Successfully moved card to new column'))
      } else if (this.context.action == 'edited') {
        // TODO: Need to workout the correct specification for this
      } else if (this.context.action == 'deleted') {
        // TODO: Need to workout the correct specification for this
      }
    })
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
