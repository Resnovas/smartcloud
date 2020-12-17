import { loggingData } from '@videndum/utilities'
import { log } from '../..'
import { Project } from '../projects'

export async function syncRemoteProject(this: Project) {
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
      projects = await this.util.api.project.projects.user(remote.user)
    else if (remote.owner && !remote.repo)
      projects = await this.util.api.project.projects.org(remote.owner)
    else if (remote.owner && remote.repo)
      projects = await this.util.api.project.projects.repo(
        remote.owner,
        remote.repo
      )
    if (!projects) throw log(new loggingData('500', 'No project to use'))
    // Get the column
    const project = projects.filter(
      project => project.name === remote.project
    )[0]
    const columns = await this.util.api.project.column.list(project.id)
    if (!columns) throw log(new loggingData('500', 'No column to use'))
    remoteColumn = columns.filter(
      column => column.name === this.context.props.localColumn.name
    )[0]
    if (this.context.action !== 'created') {
      // Get the cards
      if (this.context.action == 'moved') {
        oldLocalColumn = await this.util.api.project.column.get(
          this.context.props.changes.column_id.from
        )
        oldRemoteColumn = columns.filter(
          column => column.name === oldLocalColumn.name
        )[0]
        remoteCard = await this.util.api.project.column.listCards(
          oldRemoteColumn.id
        )
      } else {
        remoteCard = await this.util.api.project.column.listCards(
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
      this.util.api.project.card.create(
        this.context.IDNumber,
        remoteColumn.id,
        'Issue'
      )
    } else if (this.context.action == 'moved') {
      this.util.api.project.card
        .move(remoteCard.id, remoteColumn.id)
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
