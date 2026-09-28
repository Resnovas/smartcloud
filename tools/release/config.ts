// Synced from Resnovas/.github templates/tools/release/config.ts. Edit it there,
// not here: the next house sync overwrites local edits.
//
// Reads release.config.json, the one place a repository says what its
// releases ship. Every release tool and the house release workflows read it.
//
//   {
//     "name": "smartcloud",                                   // the release name; default: package.json's name without its scope
//     "firstRelease": "2.0.0",                                // the version the first stable release takes; default "1.0.0"
//     "majorTag": true,                                       // move v<major> to each stable release (GitHub Actions pin it); default false
//     "bundles": [{ "target": "@resnovas/action:bundle", "output": "dist/index.js", "project": "@resnovas/action" }],
//     "dropFromReleaseCommit": ["externals"],                 // paths the release commit leaves out; default []
//     "apps": ["apps/action", "apps/cli"],                    // directories whose package.json a nightly stamps and whose CHANGELOG.md the changelog pull request carries; default []
//     "nightly": { "major": 2 },                              // cut nightly pre-releases previewing that major; absent: no nightlies
//     "posthog": { "host": "https://eu.posthog.com", "projectId": "285077" },  // where source maps go; absent: maps are deleted, not uploaded
//     "npm": { "prepare": "node tools/release/prepare-cli.ts", "directory": "apps/cli/release", "bundleTargets": ["@resnovas/smartcloud:bundle"], "sbomProjects": ["@resnovas/smartcloud"] },
//     "versionGlobal": "__SMARTCLOUD_VERSION__"               // the global tools/release/bundle.ts stamps the version into; default "__APP_VERSION__"
//   }
//
// Runs on Node's built-in TypeScript support and needs no dependencies.

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/** A bundle the release builds, commits to the release commit, verifies from the tag and attests. */
export interface ReleaseBundle {
  /** The Nx target that builds it, for example `@resnovas/action:bundle`. */
  readonly target: string
  /** The bundle's path from the repository root, for example `dist/index.js`. */
  readonly output: string
  /** The package that owns it, whose SBOM the attestation binds to it. */
  readonly project?: string
}

/** How a release publishes a package to npm from a prepared directory. */
export interface NpmRelease {
  /** A command run from the tag before publishing, for example a script that writes the package's package.json. */
  readonly prepare?: string
  /** The directory `npm publish` runs in. */
  readonly directory: string
  /** Nx targets run from the tag before `prepare`, for the bundles the package ships. */
  readonly bundleTargets: ReadonlyArray<string>
  /** Packages whose SBOM the release generates, beside the bundles' own. */
  readonly sbomProjects: ReadonlyArray<string>
}

/** The validated contents of release.config.json, with defaults filled in. */
export interface ReleaseConfig {
  readonly name: string
  readonly firstRelease: string
  readonly majorTag: boolean
  readonly bundles: ReadonlyArray<ReleaseBundle>
  readonly dropFromReleaseCommit: ReadonlyArray<string>
  readonly apps: ReadonlyArray<string>
  readonly nightly?: { readonly major: number }
  readonly posthog?: { readonly host: string; readonly projectId: string }
  readonly npm?: NpmRelease
  readonly versionGlobal: string
}

/** The file's name, at the repository root. */
export const CONFIG_FILE = 'release.config.json'

const fail = (path: string, expected: string): never => {
  throw new Error(`${CONFIG_FILE}: ${path} must be ${expected}`)
}
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
const string = (value: unknown, path: string): string =>
  typeof value === 'string' && value.trim() !== '' ? value : fail(path, 'a non-empty string')
const optionalString = (value: unknown, path: string, fallback: string): string =>
  value === undefined ? fallback : string(value, path)
const optionalBoolean = (value: unknown, path: string, fallback: boolean): boolean =>
  value === undefined ? fallback : typeof value === 'boolean' ? value : fail(path, 'true or false')
const strings = (value: unknown, path: string): ReadonlyArray<string> =>
  value === undefined
    ? []
    : Array.isArray(value)
      ? value.map((item, index) => string(item, `${path}[${index}]`))
      : fail(path, 'a list of strings')

/**
 * Validates the parsed contents of release.config.json and fills in the defaults.
 *
 * @param raw - The parsed JSON.
 * @param packageName - The repository's package.json name, for the default release name.
 * @returns The configuration.
 * @throws When a field has the wrong shape; the message names the field.
 */
export const parseReleaseConfig = (raw: unknown, packageName: string): ReleaseConfig => {
  if (!isRecord(raw)) return fail('the file', 'a JSON object')
  const nightly = raw['nightly']
  const posthog = raw['posthog']
  const npm = raw['npm']
  const bundles = raw['bundles']
  return {
    name: optionalString(raw['name'], 'name', packageName.replace(/^@[^/]+\//, '')),
    firstRelease: optionalString(raw['firstRelease'], 'firstRelease', '1.0.0'),
    majorTag: optionalBoolean(raw['majorTag'], 'majorTag', false),
    bundles:
      bundles === undefined
        ? []
        : Array.isArray(bundles)
          ? bundles.map((bundle, index) => {
              if (!isRecord(bundle)) return fail(`bundles[${index}]`, 'an object with target and output')
              const project = bundle['project']
              return {
                target: string(bundle['target'], `bundles[${index}].target`),
                output: string(bundle['output'], `bundles[${index}].output`),
                ...(project === undefined ? {} : { project: string(project, `bundles[${index}].project`) }),
              }
            })
          : fail('bundles', 'a list'),
    dropFromReleaseCommit: strings(raw['dropFromReleaseCommit'], 'dropFromReleaseCommit'),
    apps: strings(raw['apps'], 'apps'),
    ...(nightly === undefined
      ? {}
      : {
          nightly: {
            major:
              isRecord(nightly) && Number.isInteger(nightly['major']) && Number(nightly['major']) >= 0
                ? Number(nightly['major'])
                : fail('nightly.major', 'a whole number'),
          },
        }),
    ...(posthog === undefined
      ? {}
      : {
          posthog: isRecord(posthog)
            ? {
                host: optionalString(posthog['host'], 'posthog.host', 'https://eu.posthog.com'),
                projectId: string(posthog['projectId'], 'posthog.projectId'),
              }
            : fail('posthog', 'an object with projectId'),
        }),
    ...(npm === undefined
      ? {}
      : {
          npm: isRecord(npm)
            ? {
                ...(npm['prepare'] === undefined ? {} : { prepare: string(npm['prepare'], 'npm.prepare') }),
                directory: string(npm['directory'], 'npm.directory'),
                bundleTargets: strings(npm['bundleTargets'], 'npm.bundleTargets'),
                sbomProjects: strings(npm['sbomProjects'], 'npm.sbomProjects'),
              }
            : fail('npm', 'an object with directory'),
        }),
    versionGlobal: optionalString(raw['versionGlobal'], 'versionGlobal', '__APP_VERSION__'),
  }
}

/**
 * Reads and validates release.config.json at the repository root.
 *
 * @param root - The repository root.
 * @returns The configuration, with defaults filled in.
 */
export const loadReleaseConfig = (root: string): ReleaseConfig => {
  const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as { name?: unknown }
  const packageName = typeof manifest.name === 'string' ? manifest.name : 'release'
  return parseReleaseConfig(JSON.parse(readFileSync(join(root, CONFIG_FILE), 'utf8')), packageName)
}

/**
 * The file name `pnpm sbom --out '%s-%v.spdx.json'` gives a package's SBOM.
 *
 * @param project - The package name, for example `@resnovas/action`.
 * @param version - The released version.
 * @returns `resnovas-action-<version>.spdx.json` for that example.
 */
export const sbomFileName = (project: string, version: string): string =>
  `${project.replace(/^@/, '').replaceAll('/', '-')}-${version}.spdx.json`
