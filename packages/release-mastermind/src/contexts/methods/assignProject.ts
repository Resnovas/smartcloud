import { loggingData } from '@videndum/utilities'
import { Issues, PullRequests } from '..'
import { log } from '../..'
import { api } from '../../api'
import { evaluator } from '../../evaluator'

export async function assignProject(this: Issues | PullRequests) {
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
        ? evaluator(remote, this.context.props)
        : true

    if (should) {
      log(new loggingData('100', `Adding to project ${project.name}`))
      !this.dryRun &&
        (await api.project.card
          .create(
            { client: this.client, repo: this.repo },
            this.context.IDNumber,
            remoteColumn.id,
            'PullRequest'
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
