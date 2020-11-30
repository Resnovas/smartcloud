import { GitHub } from '@actions/github'
import { log } from '..'
import { api, Repo } from '../api'
import { Labels, Runners } from '../types'
import { formatColor } from './parsingData'

/**
 * Syncronise labels to repository
 * @author IvanFon, TGTGamer, jbinda
 * @since 1.0.0
 */
export async function sync({
  client,
  config,
  repo,
  dryRun
}: {
  client: GitHub
  config: Runners['labels']
  repo: Repo
  dryRun: boolean
}) {
  /**
   * Syncronises the repo labels
   * !todo Add delete labels
   * @since 2.0.0
   */
  if (!config) throw new Error('Cannot syncronise labels without config')
  const curLabels: Labels = await api.labels
    .get({ client, repo })
    .catch(err => {
      log(`Error thrown while getting labels: ` + err, 5)
      throw err
    })
  log(`curLabels: ${JSON.stringify(curLabels)}`, 1)
  for (const configLabel of Object.values(config)) {
    const label = curLabels[configLabel.name.toLowerCase()]

    /**
     * Update label
     * @author IvanFon, TGTGamer, jbinda
     * @since 1.0.0
     */
    if (label) {
      if (
        (label.description !== configLabel.description &&
          configLabel.description !== undefined) ||
        label.color !== formatColor(configLabel.color)
      ) {
        log(
          `Recreate ${JSON.stringify(configLabel)} (prev: ${JSON.stringify(
            label
          )})`,
          2
        )
        await api.labels
          .update({ client, repo, label: configLabel, dryRun })
          .catch(err => {
            log(`Error thrown while updating label: ` + err, 5)
          })
      } else {
        log(`No action required to update label: ${label.name}`, 2)
      }

      /**
       * Create label
       * @author IvanFon, TGTGamer, jbinda
       * @since 1.0.0
       */
    } else {
      log(`Create ${JSON.stringify(configLabel)}`, 2)
      await api.labels
        .create({ client, repo, label: configLabel, dryRun })
        .catch(err => {
          log(`Error thrown while creating label: ` + err, 5)
        })
    }
  }

  for (const curLabel of Object.values(curLabels)) {
    const label = config[curLabel.name.toLowerCase()]
    if (!label) {
      log(`Delete ${JSON.stringify(curLabel)}`, 4)
      await api.labels
        .del({ client, repo, name: curLabel.name, dryRun })
        .catch(err => {
          log(`Error thrown while deleting label: ` + err, 5)
        })
    }
  }
}

/**
 * Add or Remove Labels
 * @author IvanFon, TGTGamer, jbinda
 * @since 1.0.0
 */
export async function addRemove({
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
  if (!curLabels || !labelName)
    return log(
      `Can't run add or remove labels if you don't provide ${
        !curLabels
          ? `the current labels ${curLabels}`
          : `the name of the label you want to apply: ${labelName}`
      }`,
      2
    )
  log(
    `Current label: ${labelName.toLowerCase()} -- Does issue have label: ${Boolean(
      curLabels[labelName.toLowerCase()]
    )} but should it: ${shouldHaveLabel}`,
    1
  )
  const hasLabel = Boolean(curLabels[labelName.toLowerCase()])
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
      `No action required for label "${labelID}"${
        hasLabel ? ' as label is already applied.' : '.'
      }`,
      2
    )
  }
}
