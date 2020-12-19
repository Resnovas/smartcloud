import * as core from '@actions/core'
import * as github from '@actions/github'
import { Logger, loggingData } from '@videndum/utilities'
import path from 'path'
import releaseMastermind from './action'
const L = new Logger({
  console: { enabled: false },
  sentry: {
    enabled: true,
    config: {
      dsn:
        'https://3ed727f54ce94ff7aca190b01eb17caa@o237244.ingest.sentry.io/5546354'
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

let local: any = undefined
let dryRun: boolean
let showLogs: boolean = false

try {
  local = require('../config.json')
  dryRun = local.GH_ACTION_LOCAL_TEST || false
  showLogs = local.SHOW_LOGS || false
} catch {}

const { GITHUB_WORKSPACE = '' } = process.env

/**
 * Runs the action
 * @author TGTGamer
 * @since 1.0.0
 */
async function run() {
  if (dryRun)
    log(
      new loggingData(
        '300',
        `Release Mastermind is running in local dryrun mode. No Actions will be applyed`
      )
    )
  const configInput = JSON.parse(
    core.getInput('configJSON') === '' ? '{}' : core.getInput('configJSON')
  )
  const GITHUB_TOKEN =
    core.getInput('GITHUB_TOKEN') ||
    (local == undefined ? undefined : local.GITHUB_TOKEN)
  if (!GITHUB_TOKEN) {
    return core.setFailed('No Token provided')
  }
  const options = {
    configPath: path.join(GITHUB_WORKSPACE, core.getInput('config')),
    configJSON:
      configInput.releaseMastermind ||
      (configInput?.pr || configInput?.issue || configInput?.project
        ? configInput
        : local == undefined
        ? undefined
        : require(local.configJSON).releaseMastermind
        ? require(local.configJSON).releaseMastermind
        : require(local.configJSON)),
    showLogs,
    dryRun
  }
  const action = new releaseMastermind(new github.GitHub(GITHUB_TOKEN), options)
  action.run().catch(err => {
    log(
      new loggingData(
        '800',
        `Release Mastermind did not complete due to error:`,
        err
      )
    )
  })
}
run()
