import * as core from '@actions/core'
import classes, { global } from './classes'
async function run (): Promise<void> {
  try {
    const inputdata = {
      mode: core.getInput('mode'),
      file: core.getInput('settingsjson'),
      settings: core.getInput('settings'),
      token: core.getInput('token')
    }
    core.debug(`mode is ${inputdata.mode}.`)
    core.debug(`file is ${inputdata.file}.`)
    core.debug(`settings are ${inputdata.settings}.`)
    const settings = await global.parseSettings(inputdata).catch(err => {
      core.setFailed(err)
    })
    classes.global.useSettings(inputdata.mode, settings)
  } catch (error) {
    core.setFailed(error)
  }
}

run()
