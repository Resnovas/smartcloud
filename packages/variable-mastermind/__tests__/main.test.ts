import * as classes from '../src/classes'
import * as settings from '../.github/allconfigs.json'
import * as config from './config.json'
test('string settings input', async () => {
  await expect(
    classes.global.parseSettings({
      token: config.token,
      settings: settings
    })
  )
})
test('file settings input', async () => {
  const input = '.github/allconfigs.json'
  await classes.global.parseSettings({
    token: config.token,
    file: input,
    owner: 'Videndum',
    repo: 'manage-github-secrets'
  })
})
test('blank settings input', async () => {
  const input = ''
  await expect(
    classes.global.parseSettings({
      token: config.token,
      settings: input
    })
  )
})
test('use settings with output', async () => {
  await classes.global.useSettings('output', settings)
})
// test('use settings with environment', async () => {
//   await classes.global.useSettings('environment', settings)
// })
// test('use settings with secret', async () => {
//   await classes.global.useSettings('secret', settings)
// })
