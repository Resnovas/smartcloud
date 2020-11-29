import { GitHub } from '@actions/github'
import path from 'path'
import { log } from '.'
import { api, ApiProps, Repo } from './api'
import { Version } from './conditions'
import { Config, Labels, Runners } from './types'

class Utils {
  /**
   * Formats the hex color code to ensure no hash (#) is included
   * @author IvanFon, TGTGamer
   * @param {String} color Hex color code
   * @since 1.0.0
   */
  formatColor = (color: string) => {
    if (color.charAt(0) === '#') {
      return color.substr(1)
    } else {
      return color
    }
  }

  /**
   * Formats the hex color code to ensure no hash (#) is included
   * @author IvanFon, jbinda
   * @param {String} pattern Regex partern to use
   * @since 1.0.0
   */
  processRegExpPattern = (pattern: string) => {
    const matchDelimiters = pattern.match(/^\/(.*)\/(.*)$/)

    const [, source, flags] = matchDelimiters || []

    return new RegExp(source || pattern, flags)
  }

  /**
   * Normalizes text toUpperCase
   * @author IvanFon, TGTGamer
   * @since 1.0.0
   */
  normalize = (text: string) => (text || '').toUpperCase()

  /**
   * Gets the version information
   * @author IvanFon, TGTGamer
   * @since 1.0.0
   */
  async parseVersion(
    { client, repo }: ApiProps,
    config: Config,
    ref?: string
  ): Promise<Version> {
    let rawVersion
    if (config.projectType === 'node') {
      rawVersion = await this.getNodeVersion(
        { client, repo },
        config.root,
        ref
      ).catch(err => {
        log(`Error thrown while parsing node project: ` + err, 5)
        throw err
      })
    } else {
      throw new Error("There isn't any version to use")
    }
    if (!rawVersion) rawVersion = '0.0.0'

    if (config.versioning == 'SemVer' || config.versioning == undefined) {
      let SemVer = rawVersion.split('.')
      let versioning: Version['semantic'] = {
        major: +SemVer[0],
        minor: +SemVer[1],
        patch: +SemVer[2].split('+')[0].split('-')[0],
        prerelease: rawVersion.split('-')[1]?.split('+')[0],
        build: +rawVersion.split('+')[1]
      }
      return { semantic: versioning }
    }
    return { name: rawVersion }
  }

  async getNodeVersion(
    { client, repo }: ApiProps,
    root: string,
    ref?: string
  ): Promise<string> {
    const file = path.join(root, '/package.json')
    log(`Getting file: ${file}`, 1)
    return JSON.parse(await api.files.get({ client, repo }, file, ref)).version
  }

  /**
   * Syncronise labels to repository
   * @author IvanFon, TGTGamer, jbinda
   * @since 1.0.0
   */
  async syncLabels({
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
          label.color !== utils.formatColor(configLabel.color)
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
}

export const utils = new Utils()
