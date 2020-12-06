/**
 * Runs the Action
 * @author IvanFon, TGTGamer, jbinda
 * @since 1.0.0
 */

import * as core from '@actions/core'
import * as github from '@actions/github'
import { Options, Config } from './types'
import path from 'path'
import labelMastermind from './labelMastermind'
import { Logger, loggingData } from '@videndum/utilities'
let local: any = undefined
let dryRun: boolean
let showLogs: boolean = false
try {
  local = require('../config.json')
  dryRun = local.GH_ACTION_LOCAL_TEST || false
  showLogs = local.SHOW_LOGS || false
} catch {}

const { GITHUB_WORKSPACE = '' } = process.env

const L = new Logger({
  sentry: {
    enabled: !showLogs,
    config: {
      dsn:
        'https://e7dd11f1f35b46048a62a8de2b69fa83@o237244.ingest.sentry.io/5508005'
    }
  }
})
export function log(loggingData: loggingData) {
  L.log(loggingData)
  const type = Number(loggingData.name) / 100
  if (type == 1) core.debug(loggingData.message)
  else if (type < 4) core.info(loggingData.message)
  else if (type == 4) core.warning(loggingData.message)
  else if (type < 7) core.error(loggingData.message)
  else core.setFailed(loggingData.message)
}

function start() {
  if (dryRun)
    log(
      new loggingData(
        '300',
        `Label Mastermind is running in local dryrun mode. No labels will be applyed`
      )
    )
  const configInput = JSON.parse(
    core.getInput('configJSON') === '' ? '{}' : core.getInput('configJSON')
  )
  const configJSON: Config =
    configInput.SuperLabeler ||
    (configInput.labels
      ? configInput
      : local == undefined
      ? undefined
      : require(local.configJSON))
  const configFile = core.getInput('config')
  log(new loggingData('100', `Config file ${configFile}`))
  const configPath = path.join(GITHUB_WORKSPACE, configFile)
  log(new loggingData('100', `Config Path ${configPath}`))
  const GITHUB_TOKEN =
    core.getInput('GITHUB_TOKEN') ||
    (local == undefined ? undefined : local.GITHUB_TOKEN)
  if (!GITHUB_TOKEN) {
    return core.setFailed('No Token provided')
  }
  log(new loggingData('100', 'Github Token Collected '))
  const options: Options = {
    configPath,
    showLogs,
    configJSON,
    dryRun
  }
  const action = new labelMastermind(new github.GitHub(GITHUB_TOKEN), options)
  action.run()
}
start()
