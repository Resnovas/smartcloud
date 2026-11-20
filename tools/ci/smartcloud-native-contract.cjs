// Synced from Resnovas/.github. This strict recipe is only for smartcloud's own action build.
const { readFileSync } = require('node:fs')
const { join } = require('node:path')

/** Accept only the reviewed native recipe; even an extra step can cross the token boundary. */
exports.checkNativeWorkflow = (workflow, repository) => {
  const expected = readFileSync(join(__dirname, 'smartcloud-native.yml'), 'utf8')
  const normalize = (source) => source.replace(/\r\n/g, '\n').trim()
  if (repository !== 'Resnovas/smartcloud' || normalize(workflow) !== normalize(expected)) {
    throw new Error('Native self-build is only for Resnovas/smartcloud. Restore tools/ci/smartcloud-native.yml verbatim: trusted main build/config, queue metadata/checkRunId guard, no lifecycle scripts, post-build split tokens and no full app token on merge_group. Required queue checks must execute.')
  }
}
