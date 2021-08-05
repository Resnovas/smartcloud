import { LoggingLevels } from '@videndum/utilities'
import { Issues, Project, PullRequests, Schedule } from '..'
import { log } from '../..'
import { AbanondedConfig, StaleConfig } from '../../../types'
import { UtilThis } from '../../conditions'
import { evaluator } from '../../evaluator'

export async function checkStale(
  this: Issues | PullRequests | Project | Schedule
) {
  const config = this.config.stale
  if (!config) throw new Error('Stale is not enabled')
  if (!this.context.props) throw new Error('Context Props must exist')
  const StaleLabel = this.configs.labels?.[config.staleLabel]
  if (!StaleLabel) throw new Error('Stale Label must exist')
  const hasStale = Boolean(
    this.context.props.labels?.[StaleLabel.toLowerCase()]
  )

  if (config.stale) {
    log(
      LoggingLevels.debug,
      `Checking stale status for ${this.context.props.type} ${this.context.props.ID} - ${this.context.props.title}`
    )
    if (
      !config.stale.conditions?.find(condition => condition.type === 'isStale')
    ) {
      if (!config.stale.conditions)
        config.stale.conditions = [
          { type: 'isStale', value: config.stale.days }
        ]
      else
        config.stale.conditions.push({
          type: 'isStale',
          value: config.stale.days
        })

      if (!config.stale.requires) config.stale.requires = 1
      else config.stale.requires++
    }

    // Check to see if the issue is stale using the evaluation function
    const stale = evaluator.call(this, config.stale, this.context.props)
    log(
      LoggingLevels.notice,
      `Stale status for ${this.context.props.title}: ${stale}`
    )

    // If stale run the rest of the actions
    if (stale)
      // Apply the stale label
      this.util.labels.addRemove(
        StaleLabel,
        this.context.props.ID,
        hasStale,
        stale
      )
    // Create the stale comment
    !this.dryRun && createComment.call(this, config.stale, stale)
  }
  if (config.abandoned) {
    log(
      LoggingLevels.debug,
      `Checking abandoned status for ${this.context.props.type} ${this.context.props.ID} - ${this.context.props.title}`
    )
    if (
      !config.abandoned.conditions?.find(
        condition => condition.type === 'isAbandoned'
      )
    ) {
      if (!config.abandoned.conditions)
        config.abandoned.conditions = [
          {
            type: 'isAbandoned',
            value: config.abandoned.days,
            label: config.abandoned.label
          }
        ]
      else
        config.abandoned.conditions.push({
          type: 'isAbandoned',
          value: config.abandoned.days,
          label: config.abandoned.label
        })

      if (!config.abandoned.requires) config.abandoned.requires = 1
      else config.abandoned.requires++
    }

    // Check to see if the issue is abandoned using the evaluation function
    const abandoned = evaluator.call(this, config.abandoned, this.context.props)
    log(
      LoggingLevels.notice,
      `Abandoned status for ${this.context.props.title}: ${abandoned}`
    )

    const AbandonedLabel = this.configs.labels?.[config.abandoned.label]
    if (!AbandonedLabel) throw new Error('Stale Label must exist')

    if (abandoned && AbandonedLabel)
      // Apply the stale label
      this.util.labels.addRemove(
        AbandonedLabel,
        this.context.props.ID,
        hasStale,
        abandoned
      )

    // Create the abandoned comment
    !this.dryRun && createComment.call(this, config.abandoned, abandoned)
  }
}

async function createComment(
  this: UtilThis,
  config: AbanondedConfig | StaleConfig,
  isStale: boolean
) {
  let prefix: string = `<!--releaseMastermind: Stale-->${
      config.commentHeader || ''
    }\r\n\r\n`,
    suffix: string = `\r\n\r\n----------\r\n\r\nSimply comment, assign or modify this issue to remove the stale status \r\n\r\n${
      config.commentFooter || ''
    }`,
    body: string =
      prefix +
      (isStale ? config.comment : config.resolve) +
      '\r\n\r\n' +
      suffix,
    commentList =
      this.context.props?.type === 'pr'
        ? await this.util.api.pullRequests.reviews.list(this.context.props.ID)
        : this.context.props?.ID
        ? await this.util.api.issues.comments.list(this.context.props.ID)
        : undefined,
    previousComment: number | undefined

  if (commentList) {
    commentList.forEach(comment => {
      if (
        comment.body.includes(prefix) &&
        (!('state' in comment) || comment.state !== 'DISMISSED')
      )
        previousComment = comment.id
    })
  }
  this.util.respond(this, isStale, previousComment, body)
}
