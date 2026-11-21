// Synced from Resnovas/.github templates/tools/verification/evidence.mjs. Edit it there.
import { closeSync, constants, fstatSync, openSync, readFileSync, readdirSync, realpathSync } from 'node:fs'
import { isAbsolute, relative, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import { checkManifest, digest } from './registry.mjs'

/** Validate attached bytes and confine every artifact to the reviewed evidence directory. */
export function validateEvidence(directory, manifest, context) {
  const passed = checkManifest(manifest, context)
  const root = realpathSync(directory)
  const files = new Set()
  for (const run of manifest.runs) {
    for (const file of run.files ?? []) {
      const path = realpathSync(resolve(root, file.path))
      const local = relative(root, path)
      if (isAbsolute(local) || local.startsWith(`..${sep}`) || local === '..' || !local || files.has(path)) throw new Error('Evidence paths must be unique files inside the reviewed directory; do not follow external symlinks.')
      files.add(path)
      // Bind metadata and bytes to one open file, not two path lookups that can race.
      const descriptor = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW)
      try {
        const metadata = fstatSync(descriptor)
        if (!metadata.isFile() || metadata.size === 0 || digest(readFileSync(descriptor)) !== file.sha256) throw new Error('Evidence bytes are missing, empty or changed since review. Capture, inspect and hash them again.')
      } finally {
        closeSync(descriptor)
      }
    }
  }
  // Uploading the directory must not disclose extra logs, dotfiles or unreviewed captures.
  const inspect = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name)
      if (entry.isSymbolicLink()) throw new Error('Do not publish symlinks in evidence.')
      if (entry.isDirectory()) inspect(path)
      else if (path !== resolve(root, 'manifest.json') && !files.has(path)) throw new Error('Unlisted evidence file: remove it from the upload directory or inspect and declare it.')
    }
  }
  inspect(root)
  return passed
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const [directory, registry, contextFile] = process.argv.slice(2)
    if (!directory || !registry || !contextFile) throw new Error('Usage: evidence.mjs <evidence-directory> <registry.md> <independent-context.json>')
    const context = { ...JSON.parse(readFileSync(contextFile, 'utf8')), markdown: readFileSync(registry, 'utf8') }
    const passed = validateEvidence(directory, JSON.parse(readFileSync(resolve(directory, 'manifest.json'), 'utf8')), context)
    console.log(passed ? 'Affected feature evidence passed.' : 'Evidence is valid but contains failed, blocked or unimplemented paths.')
    process.exitCode = passed ? 0 : 1
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
