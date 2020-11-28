import * as core from '@actions/core'
import { log } from '..'
import { api, ApiProps } from '../api'
import { evaluator, ConditionSetType, Condition, CurContext } from '../conditions'
import {
  IssueConfig,
  ProjectConfig,
  PullRequestConfig
} from '../types'
import { semantic } from './helper/semantic'

export function enforceConventions(
  { client, repo }: ApiProps,
  enforceConventions:
    | PullRequestConfig['enforceConventions']
    | IssueConfig['enforceConventions']
    | ProjectConfig['enforceConventions'],
  context: CurContext
) {
  if (!enforceConventions || !enforceConventions.conventions)
    throw new Error('No enforceable conventions')
  let required = 0,
    successful = 0,
    failedMessages: string[] = []
  enforceConventions.conventions.forEach(convention => {
    if (!convention.conditions) return
    required++
    if (convention.conditions == 'semanticTitle') {
      convention.requires = 1
      let conditions: Condition[] = []
      semantic.forEach(pattern => {
        conditions.push({
          type: 'titleMatches',
          pattern: `/^${pattern}(\\(.*\\))?:/i`
        })
      })
      if (convention.contexts) {
        convention.requires++
        convention.contexts.forEach(pattern => {
          conditions.push({
            type: 'titleMatches',
            pattern: `/\\(${pattern}\\):/i`
          })
        })
      }
      convention.failedComment =
        `Semantic Conditions failed - Please title your ${
          context.type == 'pr' ? 'pull request' : 'issue'
        } using one of the valid options:\r\n\r\n Types: ` +
        semantic.join(', ') +
        (convention.contexts
          ? `\r\n\r\n Contexts: ${convention.contexts?.join(', ')}`
          : '')
      convention.conditions = conditions
    }
    if (
      evaluator(
        ConditionSetType[context.type],
        convention,
        context.type == 'issue'
          ? context.context.issueProps
          : context.type == 'project'
          ? context.context.projectProps
          : context.context.prProps
      )
    ) {
      successful++
    } else {
      failedMessages.push(convention.failedComment)
    }
  })

  if (required > successful) {
    failedMessages.forEach(fail => core.setFailed(fail))
    createConventionComment(
      context,
      enforceConventions,
      { client, repo },
      false,
      failedMessages
    )
    return false
  }
  log(`All conventions successfully enforced. Moving to next step`, 2)
  createConventionComment(context, enforceConventions, { client, repo }, true)
  return true
}

async function createConventionComment(
  CurContext: CurContext,
  enforceConventions:
    | PullRequestConfig['enforceConventions']
    | IssueConfig['enforceConventions']
    | ProjectConfig['enforceConventions'],
  { client, repo }: ApiProps,
  success: boolean,
  failMessages?: string[]
) {
  let prefix: string = `<!--releaseMastermind: Conventions-->${
      enforceConventions?.commentHeader || ''
    }\r\n\r\n`,
    suffix: string = `\r\n\r\n----------\r\n\r\nThis message will be automatically updated when you make this change\r\n\r\n${
      enforceConventions?.commentFooter || ''
    }`,
    body: string = prefix + failMessages?.join('\r\n\r\n') + suffix,
    commentList
  if (CurContext.type !== 'pr') {
    commentList = await api.issues.comments.list({
      client,
      IDNumber: CurContext.context.IDNumber,
      repo
    })
  } else {
    commentList = await api.pullRequests.reviews.list({
      client,
      IDNumber: CurContext.context.IDNumber,
      repo
    })
  }
  let previousComment: number | undefined
  if (commentList) {
    commentList.forEach((comment: any) => {
      if (comment.body.includes(prefix)) previousComment = comment.id
    })
  }
  respond(CurContext, { client, repo }, success, previousComment, body)
}

function respond(
  CurContext: CurContext,
  { client, repo }: ApiProps,
  success: boolean,
  previousComment?: number,
  body?: string
) {
  if (!previousComment && !success) {
    if (CurContext.type == 'pr')
      api.pullRequests.reviews.create(
        { client, IDNumber: CurContext.context.IDNumber, repo },
        body,
        'REQUEST_CHANGES'
      )
    else
      api.issues.comments.create(
        { client, IDNumber: CurContext.context.IDNumber, repo },
        body as string
      )
  } else if (previousComment && !success) {
    if (CurContext.type == 'pr')
      api.pullRequests.reviews.update(
        { client, IDNumber: CurContext.context.IDNumber, repo },
        previousComment,
        body as string
      )
    else
      api.issues.comments.update(
        { client, repo },
        previousComment,
        body as string
      )
  } else if (previousComment && success) {
    if (CurContext.type == 'pr')
      api.pullRequests.reviews.delete(
        { client, IDNumber: CurContext.context.IDNumber, repo },
        previousComment,
        'Conventions corrected - Review no longer required'
      )
    else api.issues.comments.delete({ client, repo }, previousComment)
  } else if (!success) {
    if (CurContext.type == 'pr')
      api.pullRequests.reviews.create(
        { client, IDNumber: CurContext.context.IDNumber, repo },
        body,
        'REQUEST_CHANGES'
      )
    else
      api.issues.comments.create(
        { client, IDNumber: CurContext.context.IDNumber, repo },
        body as string
      )
  }
}
