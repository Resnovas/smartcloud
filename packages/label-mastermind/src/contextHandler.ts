import { Context } from '@actions/github/lib/context'
import { loggingData } from '@videndum/utilities'
import { log } from '.'
import { api, ApiProps } from './api'
import {
  IssueContext,
  PRContext,
  ProjectContext,
  Reviews,
  Version
} from './conditions'
import { Config, Label, Labels } from './types'
import { utils } from './utils'

class ContextHandler {
  /**
   * Parse the PR Context
   * @author IvanFon, TGTGamer, jbinda
   * @since 1.0.0
   */
  async parsePR(
    { client, repo }: ApiProps,
    config: Config,
    context: Context
  ): Promise<PRContext | undefined> {
    const pr = context.payload.pull_request
    if (!pr || !config.pr) {
      return
    }

    log(
      new loggingData(
        '100',
        `context.payload.pull_request: ` +
          JSON.stringify(context.payload.pull_request)
      )
    )

    const IDNumber = pr.number
    const labels = await this.parseLabels(pr.labels).catch(err => {
      log(new loggingData('500', `Error thrown while parsing labels: `, err))
      throw err
    })
    const files: string[] = await api.files
      .list({ client, repo, IDNumber })
      .catch(err => {
        log(new loggingData('500', `Error thrown while listing files: `, err))
        throw err
      })

    const changes: number = await api.pullRequests
      .changes(pr.additions, pr.deletions)
      .catch(err => {
        log(
          new loggingData('500', `Error thrown while handling changes: `, err)
        )
        throw err
      })

    const reviews: Reviews = await api.pullRequests.reviews
      .list({ client, repo, IDNumber })
      .catch(err => {
        log(
          new loggingData('500', `Error thrown while handling reviews: `, err)
        )
        throw err
      })

    const pendingReview: boolean = await api.pullRequests.reviews
      .pending(reviews.length, pr.requested_reviewers.length)
      .catch(err => {
        log(
          new loggingData('500', `Error thrown while handling reviews: `, err)
        )
        throw err
      })

    const requestedChanges: number = await api.pullRequests.reviews
      .requestedChanges(reviews)
      .catch(err => {
        log(
          new loggingData('500', `Error thrown while handling reviews: `, err)
        )
        throw err
      })

    const approved: number = await api.pullRequests.reviews
      .isApproved(reviews)
      .catch(err => {
        log(
          new loggingData('500', `Error thrown while handling reviews: `, err)
        )
        throw err
      })

    const currentVersion: Version = await utils.versioning
      .parse({ client, repo }, config, config.pr.ref)
      .catch(err => {
        log(
          new loggingData('500', `Error thrown while parsing versioning: `, err)
        )
        throw err
      })

    return {
      ref: pr.base.ref,
      sha: context.sha,
      action: context.payload.action as string,
      currentVersion,
      IDNumber: context.payload.pull_request?.id,
      prProps: {
        pullRequestID: pr.id,
        branch: pr.head.ref,
        creator: pr.user.login,
        description: pr.body || '',
        isDraft: pr.draft,
        locked: pr.locked,
        state: pr.state,
        title: pr.title,
        files,
        changes,
        reviews,
        labels,
        pendingReview,
        requestedChanges,
        approved
      }
    }
  }

  /**
   * Parse the Project Context
   * @author IvanFon, TGTGamer, jbinda
   * @since 1.0.0
   */
  async parseProject(
    { client, repo }: ApiProps,
    config: Config,
    context: Context
  ): Promise<ProjectContext | undefined> {
    const project = context.payload.project_card
    if (!project || !config.project) {
      return
    }
    log(
      new loggingData(
        '100',
        `context.payload.project_card: ${JSON.stringify(
          context.payload.project_card
        )}`
      )
    )

    if (!project.content_url) throw new Error('No content information to get')
    const issueNumber: number = project.content_url.split('/').pop()
    const issue = await await api.issues.get({
      client,
      IDNumber: issueNumber,
      repo
    })

    const labels = await this.parseLabels(issue.labels).catch(err => {
      log(new loggingData('500', `Error thrown while parsing labels: `, err))
      throw err
    })

    const currentVersion: Version = await utils.versioning
      .parse({ client, repo }, config, config.project.ref)
      .catch(err => {
        log(
          new loggingData('500', `Error thrown while parsing versioning: `, err)
        )
        throw err
      })

    const changes = context.payload.changes

    return {
      sha: context.sha,
      action: context.payload.action as string,
      currentVersion,
      IDNumber: issueNumber,
      projectProps: {
        creator: issue.user.login,
        description: issue.body || '',
        locked: issue.locked,
        state: issue.state as ProjectContext['projectProps']['state'],
        title: issue.title,
        project_id: project.project_url.split('/').pop(),
        column_id: project.column_id,
        changes,
        labels,
        cardID: project.id
      }
    }
  }
  /**
   * Parse the Issue Context
   * @author IvanFon, TGTGamer, jbinda
   * @since 1.0.0
   */
  async parseIssue(
    { client, repo }: ApiProps,
    config: Config,
    context: Context
  ): Promise<IssueContext | undefined> {
    const issue = context.payload.issue
    if (!issue || !config.issue) {
      return
    }

    log(
      new loggingData(
        '100',
        `context.payload.issue: ` + JSON.stringify(context.payload.issue)
      )
    )

    const labels = await this.parseLabels(issue.labels).catch(err => {
      log(new loggingData('500', `Error thrown while parsing labels: `, err))
      throw err
    })

    const currentVersion: Version = await utils.versioning
      .parse({ client, repo }, config, config.issue.ref)
      .catch(err => {
        log(
          new loggingData('500', `Error thrown while parsing versioning: `, err)
        )
        throw err
      })

    return {
      sha: context.sha,
      action: context.payload.action as string,
      currentVersion,
      IDNumber: context.payload.issue?.id,
      issueProps: {
        creator: issue.user.login,
        description: issue.body || '',
        locked: issue.locked,
        state: issue.state,
        labels,
        title: issue.title
      }
    }
  }

  /**
   * Parse the labels
   * @author IvanFon, TGTGamer, jbinda
   * @since 1.0.0
   */
  async parseLabels(labels: any): Promise<Labels | undefined> {
    if (!Array.isArray(labels)) {
      return
    }
    return labels.reduce((acc: { [key: string]: Label }, cur) => {
      acc[cur.name.toLowerCase()] = cur
      return acc
    }, {})
  }
}

export const contextHandler = new ContextHandler()
