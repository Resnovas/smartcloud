import path from 'path'
import { log } from '..'
import { api, ApiProps } from '../api'
import { Version } from '../conditions'
import { Config } from '../types'

/**
 * Gets the version information
 * @author IvanFon, TGTGamer
 * @since 1.0.0
 */
export async function parse(
  { client, repo }: ApiProps,
  config: Config,
  ref?: string
): Promise<Version> {
  let rawVersion
  if (config.projectType === 'node') {
    rawVersion = await getNodeVersion({ client, repo }, config.root, ref).catch(
      err => {
        log(`Error thrown while parsing node project: ` + err, 5)
        throw err
      }
    )
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

export async function getNodeVersion(
  { client, repo }: ApiProps,
  root: string,
  ref?: string
): Promise<string> {
  const file = path.join(root, '/package.json')
  log(`Getting file: ${file}`, 1)
  return JSON.parse(await api.files.get({ client, repo }, file, ref)).version
}
