import * as core from '@actions/core'
import * as github from '@actions/github'
import { Log } from '@videndum/utilities'
import path from 'path'
import releaseMastermind from './releaseMastermind'
const L = new Log({ console: { enabled: false } })

export function log(loggingData: string, type: number) {
  L.log({ raw: loggingData }, type)
  if (type == 1) core.debug(loggingData)
  else if (type < 4) core.info(loggingData)
  else if (type == 4) core.warning(loggingData)
  else if (type < 7) core.error(loggingData)
  else core.setFailed(loggingData)
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
  const token = core.getInput('TOKEN')
  const action = new releaseMastermind(new github.GitHub(GITHUB_TOKEN), options)
  action.run().catch(err => {
    log(`Label Mastermind did not complete due to error: ${err}`, 8)
    throw err
  })
}
run()
