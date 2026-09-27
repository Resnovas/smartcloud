/**
 * @file packages/runtime/src/doctor.ts
 *
 * Copyright 2021 Jonathan Stevens trading as Resnovas. All rights reserved.
 * Licensed under the Fair Core License, Version 1.0, MIT Future License
 * (FCL-1.0-MIT); see LICENSE. You may not move, change, disable or circumvent
 * the licence key functionality, or modify any part of the software that the
 * licence key protects.
 *
 * Contributions are made under the Developer Certificate of Origin (DCO.md) and
 * the Contributing Guidelines (CONTRIBUTING.md), subject to the Code of Conduct
 * (CODE_OF_CONDUCT.md) and the Cooperation Commitment (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import type { CommandExecutor } from '@effect/platform'
import { parseExtendsRef, type ResolvedConfig } from '@resnovas/config'
import { GitHub, type GitHubError, type GitHubService, type RepositoryCoordinates } from '@resnovas/integrations.github'
import { track } from '@resnovas/integrations.posthog'
import { Effect, Either, Option, Redacted, Schema } from 'effect'
import { parse } from 'yaml'
import { loadConfig, type ConfigLocation } from './config.js'
import { resolveToken, targetRepository, type Connect, type MissingToken } from './github.js'
import { configLocationFor, UnexpectedResponse } from './run.js'

/** What a token is, as its prefix tells. */
export type TokenKind = 'classic' | 'fine-grained' | 'oauth' | 'app-user' | 'installation' | 'unknown'

const TOKEN_PREFIXES: ReadonlyArray<readonly [string, TokenKind]> = [
  ['github_pat_', 'fine-grained'],
  ['ghp_', 'classic'],
  ['gho_', 'oauth'],
  ['ghu_', 'app-user'],
  ['ghs_', 'installation'],
]

const TOKEN_NAMES: Readonly<Record<TokenKind, string>> = {
  classic: 'a classic personal access token',
  'fine-grained': 'a fine-grained personal access token',
  oauth: "an OAuth token, such as the GitHub CLI's",
  'app-user': 'a GitHub App user token',
  installation: 'a GitHub App installation token, or a workflow token',
  unknown: 'a token of unknown kind',
}

/**
 * What kind of token this is, from the prefix GitHub gives every token.
 *
 * @example
 * ```ts import.meta.vitest name="tokenKind"
 * import { tokenKind } from '@resnovas/runtime'
 *
 * tokenKind('github_pat_11AB') // => 'fine-grained'
 * tokenKind('ghs_abc') // => 'installation'
 * tokenKind('0123abcd') // => 'unknown'
 * ```
 *
 * @param token - The token's value.
 * @returns Its kind; `unknown` for an old token without a prefix.
 */
export const tokenKind = (token: string): TokenKind =>
  TOKEN_PREFIXES.find(([prefix]) => token.startsWith(prefix))?.[1] ?? 'unknown'

/** One finding of `smartcloud doctor`. */
export interface DoctorCheck {
  /** What was checked, such as `token` or `secrets`. */
  readonly name: string
  readonly status: 'ok' | 'warning' | 'failure'
  readonly message: string
}

/** Everything `smartcloud doctor` found for a repository. */
export interface DoctorReport {
  readonly repository: string
  readonly checks: ReadonlyArray<DoctorCheck>
}

const ok = (name: string, message: string): DoctorCheck => ({ name, status: 'ok', message })
const warning = (name: string, message: string): DoctorCheck => ({ name, status: 'warning', message })
const failure = (name: string, message: string): DoctorCheck => ({ name, status: 'failure', message })

const cannotCreateCheckRuns = (kind: TokenKind) => kind !== 'installation' && kind !== 'unknown'

/**
 * Checks a token's kind and, for a token with scopes, the scopes smartcloud needs.
 *
 * @remarks
 * Only a GitHub App installation token or the workflow token can create
 * check runs, so any personal or OAuth token fails the smartcloud check
 * when a workflow passes it to the action. A classic or OAuth token needs
 * the `repo` scope for private presets and settings, and `workflow` for
 * the sync to change workflow files.
 *
 * @example
 * ```ts import.meta.vitest name="tokenChecks"
 * import { tokenChecks } from '@resnovas/runtime'
 *
 * tokenChecks('classic', ['repo']).map((check) => check.status).join(',') // => 'ok,warning,warning'
 * tokenChecks('installation', undefined).map((check) => check.status).join(',') // => 'ok'
 * ```
 *
 * @param kind - The token's kind, from {@link tokenKind}.
 * @param scopes - Its scopes, undefined for a token without scopes.
 * @returns The findings.
 */
export const tokenChecks = (kind: TokenKind, scopes: ReadonlyArray<string> | undefined): ReadonlyArray<DoctorCheck> => {
  const checks: Array<DoctorCheck> = [
    ok(
      'token',
      scopes === undefined
        ? TOKEN_NAMES[kind]
        : `${TOKEN_NAMES[kind]} with scopes: ${scopes.length === 0 ? 'none' : scopes.join(', ')}`,
    ),
  ]
  if (scopes !== undefined && !scopes.includes('repo'))
    checks.push(
      failure(
        'token scopes',
        'no repo scope: the token cannot read private presets or change repository settings; add the repo scope',
      ),
    )
  if (scopes !== undefined && !scopes.includes('workflow'))
    checks.push(
      warning(
        'token scopes',
        'no workflow scope: the sync cannot change files under .github/workflows; add the workflow scope',
      ),
    )
  if (cannotCreateCheckRuns(kind))
    checks.push(
      warning(
        'check runs',
        'this token cannot create check runs, so the smartcloud check fails in a workflow that passes it; in workflows, use a GitHub App token (actions/create-github-app-token) or the workflow token',
      ),
    )
  return checks
}

// The parts of the repository GitHub returns that say what the token may do there.
const RepositoryAccess = Schema.Struct({
  permissions: Schema.optional(Schema.Struct({ admin: Schema.Boolean, push: Schema.Boolean })),
})
const decodeAccess = Schema.decodeUnknownOption(RepositoryAccess)

const repositoryCheck = (github: GitHubService, name: string) =>
  Effect.map(Effect.either(github.repositoryRequest({ method: 'GET', path: '' })), (response): DoctorCheck => {
    if (Either.isLeft(response)) return failure('repository', `the token cannot read ${name}: ${response.left.message}`)
    const permissions = Option.flatMap(decodeAccess(response.right), (access) =>
      Option.fromNullable(access.permissions),
    )
    if (Option.isNone(permissions))
      return ok('repository', `the token can read ${name}; an app token's permissions come from its installation`)
    if (permissions.value.admin) return ok('repository', `the token is an admin of ${name}, so every feature can run`)
    return permissions.value.push
      ? warning('repository', `the token can write to ${name} but is not an admin: the settings feature will fail`)
      : warning(
          'repository',
          `the token can only read ${name}: labels, comments, check runs, settings and sync will fail`,
        )
  })

// A private preset in another repository is skipped by runs with the workflow token, such as pull requests from forks.
const presetChecks = (connect: Connect, coordinates: RepositoryCoordinates, resolved: ResolvedConfig) =>
  Effect.forEach(
    [
      ...new Set(
        resolved.sources
          .flatMap((source) => Option.toArray(Option.fromNullable(parseExtendsRef(source))))
          .map((ref) => `${ref.owner}/${ref.repo}`),
      ),
    ].filter((name) => name.toLowerCase() !== `${coordinates.owner}/${coordinates.repo}`.toLowerCase()),
    (name) =>
      Effect.gen(function* () {
        const [owner = '', repo = ''] = name.split('/')
        const repository = yield* Effect.flatMap(connect({ owner, repo }), (github) =>
          Effect.either(github.getRepository),
        )
        if (Either.isLeft(repository)) return warning('presets', `could not read ${name}: ${repository.left.message}`)
        return repository.right.private
          ? ok(
              'presets',
              `${name} is private: runs with the workflow token, such as pull requests from forks and Dependabot, skip its presets`,
            )
          : ok('presets', `${name} is public`)
      }),
  )

const configChecks = (connect: Connect, coordinates: RepositoryCoordinates, location: ConfigLocation) =>
  Effect.gen(function* () {
    const resolved = yield* Effect.either(loadConfig(location))
    if (Either.isLeft(resolved)) return [failure('config', resolved.left.message)]
    const presets = resolved.right.sources.length - 1
    const checks: Array<DoctorCheck> = [
      ok(
        'config',
        presets === 0
          ? 'the config is valid and extends no presets'
          : `the config and its ${presets} preset(s) resolve: ${resolved.right.sources.join(', ')}`,
      ),
      ...resolved.right.warnings.map((message) => warning('config', message)),
    ]
    return [...checks, ...(yield* presetChecks(connect, coordinates, resolved.right))]
  })

/** What a repository's workflows depend on, as `smartcloud doctor` reads them. */
export interface WorkflowUsage {
  /** Repositories, as `owner/name`, whose actions or reusable workflows a workflow uses, each with the first file that does. */
  readonly repositories: ReadonlyMap<string, string>
  /** Secrets the workflows read, other than `GITHUB_TOKEN`, each with the first file that does. */
  readonly secrets: ReadonlyMap<string, string>
  /** Variables the workflows read, each with the first file that does. */
  readonly variables: ReadonlyMap<string, string>
  /** Secrets passed to the smartcloud action as its token, each with the file that does. */
  readonly smartcloudTokens: ReadonlyMap<string, string>
}

// Each pattern is anchored or bounded by fixed characters, so matching stays linear.
const USES = /^\s*(?:-\s+)?uses:\s*['"]?([^'"\s#]+)/
const SECRET = /\bsecrets\.([A-Za-z_][A-Za-z0-9_]*)/g
const VARIABLE = /\bvars\.([A-Za-z_][A-Za-z0-9_]*)/g
const TOKEN_INPUT = /^\s*GITHUB_TOKEN:\s*\$\{\{\s*secrets\.([A-Za-z_][A-Za-z0-9_]*)\s*\}\}/

// The secrets a reusable workflow declares under `on.workflow_call.secrets`: its callers pass them in.
const CallSecrets = Schema.Struct({
  on: Schema.Struct({
    workflow_call: Schema.Struct({ secrets: Schema.Record({ key: Schema.String, value: Schema.Unknown }) }),
  }),
})
const declaredSecrets = (text: string): ReadonlySet<string> =>
  Either.match(
    Either.try(() => parse(text)),
    {
      onLeft: () => new Set(),
      onRight: (workflow) =>
        Option.match(Schema.decodeUnknownOption(CallSecrets)(workflow), {
          onNone: () => new Set(),
          onSome: (call) => new Set(Object.keys(call.on.workflow_call.secrets).map((name) => name.toUpperCase())),
        }),
    },
  )

const remember = (map: Map<string, string>, key: string, file: string) => {
  if (!map.has(key)) map.set(key, file)
}

/**
 * Reads what workflow files depend on: the repositories whose actions and
 * reusable workflows they use, the secrets and variables they read, and
 * the secrets they pass to the smartcloud action as its token.
 *
 * @remarks
 * Workflows are read line by line, not parsed: a `uses:` of another
 * repository (not `./` or `docker://`), and any `secrets.NAME` or
 * `vars.NAME` outside a comment line, count, except the secrets a reusable
 * workflow declares under `on.workflow_call.secrets`, which its callers
 * pass in. Names are upper-cased, as GitHub stores them.
 *
 * @example
 * ```ts import.meta.vitest name="workflowUsage"
 * import { workflowUsage } from '@resnovas/runtime'
 *
 * const usage = workflowUsage('Resnovas/smartcloud', [
 *   { path: '.github/workflows/a.yml', text: 'jobs:\n  a:\n    uses: Resnovas/.github/.github/workflows/graphify.yml@main\n    secrets:\n      key: ${{ secrets.BOT_KEY }}\n' },
 * ])
 * usage.repositories.get('Resnovas/.github') // => '.github/workflows/a.yml'
 * usage.secrets.has('BOT_KEY') // => true
 * ```
 *
 * @param repository - The repository the workflows are in, as `owner/name`; its own actions are left out.
 * @param files - Each workflow's path and text.
 * @returns What they use.
 */
export const workflowUsage = (
  repository: string,
  files: ReadonlyArray<{ readonly path: string; readonly text: string }>,
): WorkflowUsage => {
  const repositories = new Map<string, string>()
  const secrets = new Map<string, string>()
  const variables = new Map<string, string>()
  const smartcloudTokens = new Map<string, string>()
  for (const file of files) {
    const lines = file.text.split('\n').filter((line) => !line.trimStart().startsWith('#'))
    const declared = declaredSecrets(file.text)
    let runsSmartcloud = false
    for (const line of lines) {
      const used = USES.exec(line)?.[1]
      if (used !== undefined && !used.startsWith('./') && !used.startsWith('docker://')) {
        const [path = ''] = used.split('@')
        const [owner = '', repo = ''] = path.split('/')
        const name = `${owner}/${repo}`
        if (name.toLowerCase() === 'resnovas/smartcloud') runsSmartcloud = true
        if (name.toLowerCase() !== repository.toLowerCase()) remember(repositories, name, file.path)
      }
      for (const [, secret = ''] of line.matchAll(SECRET))
        if (secret.toUpperCase() !== 'GITHUB_TOKEN' && !declared.has(secret.toUpperCase()))
          remember(secrets, secret.toUpperCase(), file.path)
      for (const [, variable = ''] of line.matchAll(VARIABLE)) remember(variables, variable.toUpperCase(), file.path)
    }
    // The action is also run as `./` in smartcloud itself.
    if (
      runsSmartcloud ||
      (repository.toLowerCase() === 'resnovas/smartcloud' && lines.some((line) => USES.exec(line)?.[1] === './'))
    )
      for (const line of lines) {
        const secret = TOKEN_INPUT.exec(line)?.[1]
        if (secret !== undefined && secret.toUpperCase() !== 'GITHUB_TOKEN')
          remember(smartcloudTokens, secret.toUpperCase(), file.path)
      }
  }
  return { repositories, secrets, variables, smartcloudTokens }
}

const WORKFLOWS = '.github/workflows'

const readWorkflows = (github: GitHubService) =>
  Effect.gen(function* () {
    const { owner, repo } = github.coordinates
    const entries = yield* github
      .listDirectory({ owner, repo, path: WORKFLOWS })
      .pipe(Effect.catchTag('NotFound', () => Effect.succeed([])))
    const workflows = entries.filter((entry) => !entry.path.includes('/') && /\.ya?ml$/.test(entry.path))
    return yield* Effect.forEach(workflows, (entry) => {
      const path = `${WORKFLOWS}/${entry.path}`
      return Effect.map(github.getFile({ owner, repo, path }), (text) => ({ path, text }))
    })
  })

const AccessLevel = Schema.Struct({ access_level: Schema.String })
const decodeAccessLevel = Schema.decodeUnknownOption(AccessLevel)

const ACCESS_FIX =
  "set its Settings > Actions > General > Access to 'Accessible from repositories in the organization', or settings.actions.accessLevel: organization in its smartcloud config"

// Whether a repository's actions and reusable workflows can be used from `owner`'s repositories:
// the check, or the repository's name when it is public, so public ones are reported together.
const actionsAccessCheck = (
  connect: Connect,
  owner: string,
  name: string,
  file: string,
): Effect.Effect<Either.Either<DoctorCheck, string>, MissingToken, CommandExecutor.CommandExecutor> =>
  Effect.gen(function* () {
    const [sourceOwner = '', sourceRepo = ''] = name.split('/')
    const github = yield* connect({ owner: sourceOwner, repo: sourceRepo })
    const repository = yield* Effect.either(github.getRepository)
    if (Either.isLeft(repository))
      return Either.right(
        warning(
          'actions access',
          `could not read ${name}, used by ${file}, so its Actions access was not checked: ${repository.left.message}`,
        ),
      )
    if (!repository.right.private) return Either.left(name)
    const response = yield* Effect.either(
      github.repositoryRequest({ method: 'GET', path: '/actions/permissions/access' }),
    )
    if (Either.isLeft(response))
      return Either.right(
        warning(
          'actions access',
          `could not read the Actions access of ${name}, used by ${file}; reading it needs admin access: ${response.left.message}`,
        ),
      )
    const level = Option.getOrElse(
      Option.map(decodeAccessLevel(response.right), (access) => access.access_level),
      () => 'unknown',
    )
    const sameOwner = sourceOwner.toLowerCase() === owner.toLowerCase()
    return Either.right(
      level === 'enterprise' || (sameOwner && (level === 'organization' || level === 'user'))
        ? ok('actions access', `${name} is private and its Actions access (${level}) lets ${file} use it`)
        : failure(
            'actions access',
            `${name} is private and its Actions access is ${level}, so ${file} cannot use its actions or reusable workflows; ${ACCESS_FIX}`,
          ),
    )
  })

const PageCount = Schema.Struct({ total_count: Schema.Number })
const PageFields = Schema.Record({ key: Schema.String, value: Schema.Unknown })
const Names = Schema.Array(Schema.Struct({ name: Schema.String }))

// One page of a list such as `GET /actions/secrets`: its total and the names in `field`.
const decodePage = (response: unknown, field: string) =>
  Option.all({
    total: Option.map(Schema.decodeUnknownOption(PageCount)(response), (page) => page.total_count),
    names: Option.flatMap(Schema.decodeUnknownOption(PageFields)(response), (fields) =>
      Schema.decodeUnknownOption(Names)(fields[field]),
    ),
  })

// A paged list of names; fails when GitHub refuses it or answers in an unexpected shape.
const listNames = (
  github: GitHubService,
  path: string,
  field: string,
): Effect.Effect<ReadonlyArray<string>, GitHubError | UnexpectedResponse> =>
  Effect.gen(function* () {
    const names: Array<string> = []
    // 30 is the most GitHub returns per page for variables.
    for (let page = 1; ; page++) {
      const listed = decodePage(
        yield* github.repositoryRequest({ method: 'GET', path: `${path}?per_page=30&page=${page}` }),
        field,
      )
      if (Option.isNone(listed)) return yield* new UnexpectedResponse({ operation: `GET ${path}` })
      names.push(...listed.value.names.map((item) => item.name))
      if (listed.value.names.length === 0 || names.length >= listed.value.total) return names
    }
  })

// Every name the repository can read of one kind, from the repository, its organisation and its environments, and the lists that could not be read.
const available = (github: GitHubService, kind: 'secrets' | 'variables') =>
  Effect.gen(function* () {
    const environments = yield* Effect.either(listNames(github, '/environments', 'environments'))
    const sources = [
      { label: `repository ${kind}`, path: `/actions/${kind}` },
      { label: `organisation ${kind}`, path: `/actions/organization-${kind}` },
      ...(Either.isRight(environments) ? environments.right : []).map((environment) => ({
        label: `${kind} of the ${environment} environment`,
        path: `/environments/${encodeURIComponent(environment)}/${kind}`,
      })),
    ]
    const lists = yield* Effect.forEach(sources, (source) => Effect.either(listNames(github, source.path, kind)))
    const names = new Set(
      lists.flatMap((list) => (Either.isRight(list) ? list.right.map((name) => name.toUpperCase()) : [])),
    )
    const unread = [
      ...(Either.isLeft(environments) ? [`environments (${environments.left.message})`] : []),
      ...sources.flatMap((source, index) => {
        const list = lists[index]
        return list !== undefined && Either.isLeft(list) ? [`${source.label} (${list.left.message})`] : []
      }),
    ]
    return { names, unread }
  })

const presenceCheck = (github: GitHubService, kind: 'secrets' | 'variables', used: ReadonlyMap<string, string>) =>
  Effect.gen(function* () {
    if (used.size === 0) return ok(kind, `the workflows read no ${kind}`)
    const { names, unread } = yield* available(github, kind)
    const missing = [...used].filter(([name]) => !names.has(name))
    if (missing.length === 0)
      return ok(kind, `every ${kind.slice(0, -1)} the workflows read exists: ${[...used.keys()].join(', ')}`)
    const list = missing.map(([name, file]) => `${name} (read by ${file})`).join(', ')
    return unread.length === 0
      ? failure(
          kind,
          `missing ${list}; add ${missing.length === 1 ? 'it' : 'them'} in Settings > Secrets and variables > Actions, for the repository or the organisation`,
        )
      : warning(
          kind,
          `could not find ${list}, but could not read ${unread.join('; ')}; reading them needs admin access`,
        )
  })

const workflowChecks = (connect: Connect, github: GitHubService) =>
  Effect.gen(function* () {
    const { owner, repo } = github.coordinates
    const files = yield* Effect.either(readWorkflows(github))
    if (Either.isLeft(files)) return [warning('workflows', `could not read ${WORKFLOWS}: ${files.left.message}`)]
    const usage = workflowUsage(`${owner}/${repo}`, files.right)
    const tokens = [...usage.smartcloudTokens].map(([secret, file]) =>
      warning(
        'check runs',
        `${file} passes secrets.${secret} to smartcloud as its token: if that is a personal access token, the smartcloud check fails, because only a GitHub App token or the workflow token can create check runs`,
      ),
    )
    const results = yield* Effect.forEach(usage.repositories, ([name, file]) =>
      actionsAccessCheck(connect, owner, name, file),
    )
    const publics = results.flatMap((result) => (Either.isLeft(result) ? [result.left] : []))
    const access = [
      ...(publics.length === 0
        ? []
        : [ok('actions access', `public, so usable from any workflow: ${publics.join(', ')}`)]),
      ...results.flatMap((result) => (Either.isRight(result) ? [result.right] : [])),
    ]
    const secrets = yield* presenceCheck(github, 'secrets', usage.secrets)
    const variables = yield* presenceCheck(github, 'variables', usage.variables)
    return [ok('workflows', `read ${files.right.length} workflow file(s)`), ...tokens, ...access, secrets, variables]
  })

/**
 * Checks what smartcloud needs to run on a repository with the given
 * token: its kind and scopes, what it may do in the repository, whether
 * the config and every preset it extends can be read, whether private
 * repositories whose actions or reusable workflows the workflows use allow
 * it, and whether every secret and variable the workflows read exists.
 *
 * @remarks
 * Nothing is written. Run it with the token a workflow gives smartcloud to
 * check that token, or with your own to check the repository. Checks that
 * need more access than the token has are reported as warnings, not
 * failures.
 *
 * @example
 * ```ts
 * import { doctorRepository, liveConnect } from '@resnovas/runtime'
 *
 * const report = doctorRepository(liveConnect(), { repository: 'Resnovas/smartcloud' })
 * ```
 *
 * @param connect - Opens the GitHub service for a repository.
 * @param request - The repository, and a local config file to check instead of its own.
 * @param token - The token `connect` uses, to tell its kind; the one from `resolveToken` by default.
 * @returns The report.
 */
export const doctorRepository = (
  connect: Connect,
  request: { readonly repository: string; readonly config?: string | undefined },
  token: typeof resolveToken = resolveToken,
) =>
  Effect.gen(function* () {
    const coordinates = yield* targetRepository(request.repository)
    const location = yield* configLocationFor(request.config)
    const kind = tokenKind(Redacted.value(yield* token))
    const github = yield* connect(coordinates)
    const name = `${coordinates.owner}/${coordinates.repo}`
    const report = Effect.gen(function* () {
      const scopes = yield* Effect.either(github.tokenScopes)
      const repository = yield* repositoryCheck(github, name)
      const checks = [...tokenChecks(kind, Either.getOrUndefined(scopes)), repository]
      // Nothing else can be read without the repository.
      if (repository.status === 'failure') return { repository: name, checks }
      const config = yield* configChecks(connect, coordinates, location)
      const workflows = yield* workflowChecks(connect, github)
      const doctor: DoctorReport = { repository: name, checks: [...checks, ...config, ...workflows] }
      return doctor
    })
    return yield* track(report, {
      operation: 'doctor',
      repository: coordinates,
      describe: (done) => ({ failures: done.checks.filter((check) => check.status === 'failure').length }),
    }).pipe(Effect.provideService(GitHub, github))
  })

const MARKS: Readonly<Record<DoctorCheck['status'], string>> = { ok: 'ok     ', warning: 'warning', failure: 'FAIL   ' }

/**
 * A doctor report as text, one check per line, then a count.
 *
 * @example
 * ```ts import.meta.vitest name="doctorText"
 * import { doctorText } from '@resnovas/runtime'
 *
 * const text = doctorText({ repository: 'o/r', checks: [{ name: 'token', status: 'failure', message: 'no repo scope' }] })
 * text.split('\n')[1] // => 'FAIL    token: no repo scope'
 * ```
 *
 * @param report - The report.
 * @returns Plain text.
 */
export const doctorText = (report: DoctorReport): string => {
  const count = (status: DoctorCheck['status']) => report.checks.filter((check) => check.status === status).length
  return [
    `smartcloud doctor for ${report.repository}:`,
    ...report.checks.map((check) => `${MARKS[check.status]} ${check.name}: ${check.message}`),
    `${count('failure')} failure(s), ${count('warning')} warning(s).`,
  ].join('\n')
}
