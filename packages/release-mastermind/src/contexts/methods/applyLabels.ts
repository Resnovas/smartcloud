import { loggingData } from '@videndum/utilities'
import { Issues, Project, PullRequests } from '..'
import { log } from '../..'
import { evaluator } from '../../evaluator'
import { addRemove } from '../../utils/labels'

export async function applyLabels(this: Issues | PullRequests | Project) {
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
      this.context.props.labels[labelName.toLowerCase()] = this.runners.labels[
        labelID
      ]

    await addRemove({
      client: this.client,
      curLabels: this.context.props.labels,
      labelID,
      labelName,
      hasLabel,
      IDNumber: this.context.props.ID,
      repo: this.repo,
      shouldHaveLabel,
      dryRun: this.dryRun
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
