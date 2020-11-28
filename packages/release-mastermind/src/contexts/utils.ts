import * as core from '@actions/core'
import { GitHub } from '@actions/github'
import { log } from '..'
import { api, ApiProps, Repo } from '../api'
import {
  Condition,
  ConditionSetType,
  CurContext,
  evaluator
} from '../conditions'
import { IssueConfig, Labels, ProjectConfig, PullRequestConfig } from '../types'
import { semantic } from './helper/semantic'

export function enforceConventions(
  { client, repo }: ApiProps,
  enforceConventions:
    | PullRequestConfig['enforceConventions']
    | IssueConfig['enforceConventions']
    | ProjectConfig['enforceConventions'],
  context: CurContext,
  dryRun: boolean
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
    !dryRun &&
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
  !dryRun &&
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
      if (comment.body.includes(prefix) && comment.state !== 'DISMISSED')
        previousComment = comment.id
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
      api.pullRequests.reviews.dismiss(
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

/**
 * Add or Remove Labels
 * @author IvanFon, TGTGamer, jbinda
 * @since 1.0.0
 */
export async function addRemoveLabel({
  client,
  curLabels,
  labelID,
  labelName,
  IDNumber,
  repo,
  shouldHaveLabel,
  dryRun
}: {
  client: GitHub
  curLabels: Labels | undefined
  labelID: string
  labelName: string
  IDNumber: number
  repo: Repo
  shouldHaveLabel: boolean
  dryRun: boolean
}) {
  const hasLabel = curLabels?.[labelName]
  if (shouldHaveLabel && !hasLabel) {
    log(`Adding label "${labelID}"...`, 2)
    await api.labels
      .add({ client, repo, IDNumber, label: labelName, dryRun })
      .catch(err => {
        log(`Error thrown while adding labels: ` + err, 5)
      })
  } else if (!shouldHaveLabel && hasLabel) {
    log(`Removing label "${labelID}"...`, 2)
    await api.labels
      .remove({
        client,
        repo,
        IDNumber,
        label: labelName,
        dryRun
      })
      .catch(err => {
        log(`Error thrown while removing labels: ` + err, 5)
      })
  } else {
    log(
      `No action required for label "${labelID}" ${
        hasLabel ? 'as label is already applied.' : '.'
      }`,
      2
    )
  }
}
