// Synced from Resnovas/.github templates/tools/verification/build-info.mjs. Edit it there.
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

/** Verify the deployed public build-info endpoint against the full intended revision, never a branch or short SHA. */
export async function verifyBuild(url, expected, fetchInfo = fetch) {
  if (!/^[a-f0-9]{40}$/.test(expected)) throw new Error('Supply the full intended deployment commit SHA.')
  const endpoint = new URL(url)
  if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password) throw new Error('Use a credential-free HTTPS build-info URL.')
  const response = await fetchInfo(endpoint, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000) })
  if (!response.ok) throw new Error(`Build-info returned HTTP ${response.status}; deployment is not verified.`)
  const info = await response.json()
  if (info?.commit !== expected) throw new Error('Build-info commit does not match the intended revision. Wait for rollout or investigate the target; do not call the deploy done.')
  return `Verified deployed build-info commit ${expected}.`
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    console.log(await verifyBuild(process.argv[2], process.argv[3]))
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
