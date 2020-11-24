import { log } from '.'
import { ApiProps, filesAPI } from './api'
// import { filesAPI } from './api'
import { Config, version } from './types'

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
  ): Promise<version> {
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

    if (config.versioning == 'SemVer' || config.versioning == undefined) {
      let SemVer = rawVersion.split('.')
      let versioning: version['semantic'] = {
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
    const directory = process.env.GITHUB_WORKSPACE || process.cwd()
    return JSON.parse(await filesAPI.get({ client, repo }, 'package.json', ref))
      .version
  }
}

export const utils = new Utils()
