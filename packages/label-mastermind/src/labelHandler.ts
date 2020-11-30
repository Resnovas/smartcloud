import { GitHub } from '@actions/github'
import { PRContext, IssueContext } from './conditions'
import { ConditionSetType, evaluator } from './evaluator'
import { Config } from './types'
import { Repo } from './api'
import { log } from '.'
import { utils } from './utils'

/**
 * Apply Labels to Issues
 * @author IvanFon, TGTGamer, jbinda
 * @since 1.0.0
 */
export async function applyIssue({
  client,
  config,
  issueContext,
  labelIdToName,
  repo,
  dryRun
}: {
  client: GitHub
  config: Config['issue']
  issueContext: IssueContext
  labelIdToName: { [key: string]: string }
  repo: Repo
  dryRun: boolean
}) {
  const { labels: curLabels, issueProps, IDNumber } = issueContext
  for (const [labelID, conditionsConfig] of Object.entries(config.labels)) {
    log(`Label: ${labelID}`, 1)

    const shouldHaveLabel = evaluator(
      ConditionSetType.issue,
      conditionsConfig,
      issueProps
    )

    await utils.labels
      .addRemove({
        client,
        curLabels,
        labelID,
        labelName: labelIdToName[labelID],
        IDNumber,
        repo,
        shouldHaveLabel,
        dryRun
      })
      .catch(err => {
        log(`Error thrown while running addRemoveLabel: ` + err, 5)
      })
  }
}

/**
 * Apply Labels to Pull Requests
 * @author IvanFon, TGTGamer, jbinda
 * @since 1.0.0
 */
export async function applyPR({
  client,
  config,
  labelIdToName,
  prContext,
  repo,
  dryRun
}: {
  client: GitHub
  config: Config['pr']
  labelIdToName: { [key: string]: string }
  prContext: PRContext
  repo: Repo
  dryRun: boolean
}) {
  const { labels: curLabels, prProps, IDNumber } = prContext
  for (const [labelID, conditionsConfig] of Object.entries(config.labels)) {
    log(`Label: ${labelID}`, 1)

    const shouldHaveLabel = evaluator(
      ConditionSetType.pr,
      conditionsConfig,
      prProps
    )

    await utils.labels
      .addRemove({
        client,
        curLabels,
        labelID,
        labelName: labelIdToName[labelID],
        IDNumber,
        repo,
        shouldHaveLabel,
        dryRun
      })
      .catch(err => {
        log(`Error thrown while running addRemoveLabel: ` + err, 5)
      })
  }
}
