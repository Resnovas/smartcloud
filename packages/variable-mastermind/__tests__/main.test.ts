import * as settings from '../.github/allconfigs.json'
import * as settingsOLD from '../.github/allconfigs.old.json'
import { Global, inputdata } from '../src/classes'
import * as config from './config.json'

const input: inputdata = {
  mode: 'secret',
  token: config.token,
  owner: 'Videndum',
  repo: 'manage-github-secrets',
  secretname: 'SETTINGS',
  secretorg: false,
  secrets: false
}

test('string settings input', async () => {
  let globalinput = input
  globalinput.settings = JSON.stringify(settings)
  const global = new Global(globalinput)
  await expect(await global.parseSettings()).toEqual(
    settings['manage-github-secrets']
  )
})

test('file settings input', async () => {
  let globalinput = input
  globalinput.file = '.github/allconfigs.json'
  const global = new Global(globalinput)
  await expect(settingsOLD).toReturn
})

test('blank settings input', async () => {
  const global = new Global(input)
  await expect(await global.parseSettings()).toBeUndefined
})

test('use settings with output', async () => {
  const global = new Global(input)
  expect(await global.useSettings('output', settings['manage-github-secrets']))
})
