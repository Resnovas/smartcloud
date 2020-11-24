import { Context } from '@actions/github/lib/context'
import { log } from '.'
import { ApiProps } from './api'
import { Config, IssueContext, Labels, PRContext, version } from './types'
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
      `context.payload.pull_request: ` +
        JSON.stringify(context.payload.pull_request),
      1
    )

    const IDNumber = pr.number
    const labels: Labels = await this.parseLabels(pr.labels).catch(err => {
      log(`Error thrown while parsing labels: ` + err, 5)
      throw err
    })

    const currentVersion: version = await utils
      .parseVersion({ client, repo }, config, config.pr.ref || pr.base.ref)
      .catch(err => {
        log(`Error thrown while parsing versioning: ` + err, 5)
        throw err
      })

    return {
      ref: pr.base.ref,
      action: context.payload.action as string,
      currentVersion,
      labels,
      IDNumber,
      prProps: {
        branch: pr.head.ref,
        creator: pr.user.login,
        description: pr.body || '',
        state: pr.state,
        title: pr.title
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

    log(`context.payload.issue: ` + JSON.stringify(context.payload.issue), 1)

    const labels: Labels = await this.parseLabels(issue.labels).catch(err => {
      log(`Error thrown while parsing labels: ` + err, 5)
      throw err
    })

    const currentVersion: version = await utils
      .parseVersion({ client, repo }, config, config.issue.ref)
      .catch(err => {
        log(`Error thrown while parsing versioning: ` + err, 5)
        throw err
      })

    return {
      action: context.payload.action as string,
      currentVersion,
      labels,
      IDNumber: issue.number,
      issueProps: {
        creator: issue.user.login,
        description: issue.body || '',
        state: issue.state,
        title: issue.title
      }
    }
  }

  /**
   * Parse the labels
   * @author IvanFon, TGTGamer, jbinda
   * @since 1.0.0
   */
  async parseLabels(labels: any): Promise<Labels> {
    if (!Array.isArray(labels)) {
      return []
    }
    let returnLabels: Labels = []
    labels.forEach(label => {
      if (label.name) returnLabels.push(label.name)
    })

    return returnLabels
  }
}

export const contextHandler = new ContextHandler()
