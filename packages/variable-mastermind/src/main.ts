import * as core from '@actions/core'
import { Global, inputdata } from './classes'
async function run(): Promise<void> {
  try {
    const inputdata: inputdata = {
      mode: core.getInput('mode') || 'outputs',
      file: core.getInput('settingsjson') || '.github/allconfigs.json',
      settings: core.getInput('settings'),
      secrets: core.getInput('secretupdates') == 'true' || false,
      secretname: core.getInput('secretname') || 'SETTINGS',
      secretorg: core.getInput('secretOrg') == 'true' || false,
      token: core.getInput('token')
    }
    if (!inputdata.token) throw new Error('No token provided')
    const global = new Global(inputdata)
    core.debug(`mode is ${inputdata.mode}.`)
    core.debug(`file is ${inputdata.file}.`)
    core.debug(`settings are ${inputdata.settings}.`)
    core.debug(`secrets are ${inputdata.secrets}.`)
    core.debug(`secretname are ${inputdata.secretname}.`)
    core.debug(`secretorg are ${inputdata.secretorg}.`)
    const settings = await global.parseSettings().catch(err => {
      core.setFailed(err)
    })
    global.useSettings(inputdata.mode, settings)
    if (inputdata.secrets)
      global.updateSecret({
        data: JSON.stringify(settings),
        name: inputdata.secretname
      })
  } catch (error) {
    core.setFailed(error)
  }
}

run()
