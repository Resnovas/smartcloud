/**
 * @file tools/dev/surfaces.ts
 *
 * Copyright 2021 Jonathan Stevens trading as Resnovas. All rights reserved.
 * Licensed under the Fair Core License, Version 1.0, MIT Future License
 * (FCL-1.0-MIT); see LICENSE. You may not move, change, disable or circumvent
 * the licence key functionality, or modify any part of the software that the
 * licence key protects.
 *
 * Contributions are made under the Developer Certificate of Origin (DCO.md) and
 * the Contributing Guidelines (CONTRIBUTING.md), subject to the Code of Conduct
 * (CODE_OF_CONDUCT.md) and the Eventiva Cooperation Commitment
 * (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

// Keeps the one-click surfaces that editors and agent apps cannot read from
// the repository in step with it (house standard project-dev-surfaces).
//
//   node tools/dev/surfaces.ts sync      write the agent commands from .agents/prompts
//   node tools/dev/surfaces.ts check     exit 1 if the agent commands are out of date
//   node tools/dev/surfaces.ts install   register actions and prompts in Orca and OpenChamber
//   node tools/dev/surfaces.ts install --dry-run
//
// `.agents/surfaces.json` lists the actions (each one a package script) and the
// agents that get a button per prompt. `.agents/prompts/<id>.md` holds each
// prompt once; `sync` writes it to `.claude/commands`, `.cursor/commands` and
// `.opencode/commands`, which this tool owns outright.
//
// Orca keeps quick commands, and OpenChamber keeps project actions, in
// per-user settings rather than in the repository, so `install` writes them
// there for this checkout. It only touches entries whose id starts with the
// manifest's name, so it never removes anything added by hand. It reads Orca's
// runtime token from Orca's own metadata file at run time and never stores it.

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createConnection } from 'node:net'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'

interface Action {
  readonly id: string
  readonly label: string
  readonly script: string
  readonly url?: string
  readonly primary?: boolean
}

interface Manifest {
  readonly name: string
  readonly agents: ReadonlyArray<string>
  readonly actions: ReadonlyArray<Action>
}

interface Prompt {
  readonly id: string
  readonly label: string
  readonly description: string
  readonly argumentHint: string | undefined
  readonly body: string
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const manifest = JSON.parse(readFileSync(join(root, '.agents/surfaces.json'), 'utf8')) as Manifest
const [command, ...flags] = process.argv.slice(2)
const dryRun = flags.includes('--dry-run')

const agentNames: Record<string, string> = {
  claude: 'Claude',
  codex: 'Codex',
  opencode: 'OpenCode',
  gemini: 'Gemini',
  cursor: 'Cursor',
}

// --- Prompts -----------------------------------------------------------------

const readPrompts = (): Array<Prompt> => {
  const directory = join(root, '.agents/prompts')
  return readdirSync(directory)
    .filter((file) => file.endsWith('.md'))
    .sort()
    .map((file) => {
      const text = readFileSync(join(directory, file), 'utf8')
      const match = /^---\n([\s\S]*?)\n---\n+([\s\S]*)$/.exec(text)
      if (match === null) throw new Error(`.agents/prompts/${file} has no frontmatter.`)
      const fields = new Map(
        (match[1] ?? '').split('\n').flatMap((line) => {
          const colon = line.indexOf(':')
          return colon === -1 ? [] : [[line.slice(0, colon).trim(), line.slice(colon + 1).trim()] as const]
        }),
      )
      const id = file.slice(0, -'.md'.length)
      return {
        id,
        label: fields.get('label') ?? id,
        description: fields.get('description') ?? '',
        argumentHint: fields.get('argument-hint'),
        body: (match[2] ?? '').trimEnd() + '\n',
      }
    })
}

const frontmatter = (fields: ReadonlyArray<readonly [string, string | undefined]>): string => {
  const lines = fields.flatMap(([key, value]) => (value === undefined || value === '' ? [] : [`${key}: ${value}`]))
  return lines.length === 0 ? '' : `---\n${lines.join('\n')}\n---\n\n`
}

// Each agent command directory maps a prompt to that tool's file format.
const targets: ReadonlyArray<{ readonly directory: string; readonly render: (prompt: Prompt) => string }> = [
  {
    directory: '.claude/commands',
    render: (prompt) =>
      frontmatter([
        ['description', prompt.description],
        ['argument-hint', prompt.argumentHint],
      ]) + prompt.body,
  },
  { directory: '.cursor/commands', render: (prompt) => prompt.body },
  {
    directory: '.opencode/commands',
    render: (prompt) => frontmatter([['description', prompt.description]]) + prompt.body,
  },
]

// Returns the files that differ from what the prompts produce.
const syncPrompts = (write: boolean): Array<string> => {
  const prompts = readPrompts()
  const stale: Array<string> = []
  for (const target of targets) {
    const directory = join(root, target.directory)
    const wanted = new Map(prompts.map((prompt) => [`${prompt.id}.md`, target.render(prompt)]))
    const present = existsSync(directory) ? readdirSync(directory).filter((file) => file.endsWith('.md')) : []
    for (const file of present) {
      if (wanted.has(file)) continue
      stale.push(`${target.directory}/${file}`)
      if (write) rmSync(join(directory, file))
    }
    for (const [file, content] of wanted) {
      const path = join(directory, file)
      if (existsSync(path) && readFileSync(path, 'utf8') === content) continue
      stale.push(`${target.directory}/${file}`)
      if (write) {
        mkdirSync(directory, { recursive: true })
        writeFileSync(path, content)
      }
    }
  }
  return stale
}

// --- Orca ----------------------------------------------------------------------

interface OrcaMetadata {
  readonly authToken: string
  readonly transports: ReadonlyArray<{ readonly kind: string; readonly endpoint: string }>
}

interface QuickCommand {
  readonly id: string
  readonly label: string
  readonly scope?: { readonly type: string; readonly repoId?: string }
  readonly [key: string]: unknown
}

const orcaUserData = (): string => {
  if (process.env['ORCA_USER_DATA_PATH']) return process.env['ORCA_USER_DATA_PATH']
  if (process.platform === 'darwin') return join(homedir(), 'Library', 'Application Support', 'orca')
  if (process.platform === 'win32') return join(process.env['APPDATA'] ?? join(homedir(), 'AppData', 'Roaming'), 'orca')
  return join(process.env['XDG_CONFIG_HOME'] ?? join(homedir(), '.config'), 'orca')
}

const orcaCall = (metadata: OrcaMetadata, method: string, params: unknown): Promise<unknown> =>
  new Promise((resolve, reject) => {
    const transport = metadata.transports.find((entry) => entry.kind === 'unix' || entry.kind === 'named-pipe')
    if (transport === undefined) {
      reject(new Error('Orca exposes no local socket.'))
      return
    }
    const id = randomUUID()
    const socket = createConnection(transport.endpoint)
    let buffer = ''
    const timer = setTimeout(() => {
      socket.destroy()
      reject(new Error(`Orca did not answer ${method}.`))
    }, 15_000)
    socket.setEncoding('utf8')
    socket.once('error', (error) => {
      clearTimeout(timer)
      reject(error)
    })
    socket.on('data', (chunk: string) => {
      buffer += chunk
      let newline = buffer.indexOf('\n')
      while (newline !== -1) {
        const line = buffer.slice(0, newline).trim()
        buffer = buffer.slice(newline + 1)
        newline = buffer.indexOf('\n')
        if (line === '') continue
        const frame = JSON.parse(line) as { id?: string; ok?: boolean; result?: unknown; error?: unknown }
        if (frame.id !== id) continue
        clearTimeout(timer)
        socket.end()
        if (frame.ok === false) reject(new Error(`Orca rejected ${method}: ${JSON.stringify(frame.error)}`))
        else resolve(frame.result)
        return
      }
    })
    socket.on('connect', () => {
      socket.write(`${JSON.stringify({ id, authToken: metadata.authToken, method, params })}\n`)
    })
  })

const mainCheckout = (): string => {
  const common = execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], {
    cwd: root,
    encoding: 'utf8',
  }).trim()
  return dirname(common)
}

const samePath = (left: string, right: string): boolean => {
  const normalise = (path: string) => path.replace(/\\/g, '/').replace(/\/+$/, '')
  return process.platform === 'win32'
    ? normalise(left).toLowerCase() === normalise(right).toLowerCase()
    : normalise(left) === normalise(right)
}

const installOrca = async (prompts: ReadonlyArray<Prompt>): Promise<string> => {
  const metadataPath = join(orcaUserData(), 'orca-runtime.json')
  if (!existsSync(metadataPath)) return 'Orca: not installed or never started, skipped.'
  const metadata = JSON.parse(readFileSync(metadataPath, 'utf8')) as OrcaMetadata
  let repos: ReadonlyArray<{ id: string; path: string }>
  try {
    repos = ((await orcaCall(metadata, 'repo.list', null)) as { repos: Array<{ id: string; path: string }> }).repos
  } catch {
    return 'Orca: not running, skipped. Start Orca and run this again.'
  }
  const checkout = mainCheckout()
  const repo = repos.find((entry) => samePath(entry.path, checkout) || samePath(entry.path, root))
  if (repo === undefined) return `Orca: ${checkout} is not added to Orca, skipped. Add it, then run this again.`

  const scope = { type: 'repo', repoId: repo.id }
  const prefix = `${manifest.name}:`
  const wanted: Array<Record<string, unknown>> = [
    ...manifest.actions.map((action) => ({
      id: `${prefix}${action.id}`,
      label: action.label,
      action: 'terminal-command',
      command: `pnpm run ${action.script}`,
      appendEnter: true,
      scope,
    })),
    // Orca launches a prompt as-is, so prompts that need arguments stay in the editors.
    ...prompts
      .filter((prompt) => !prompt.body.includes('$ARGUMENTS'))
      .flatMap((prompt) =>
        manifest.agents.map((agent) => ({
          id: `${prefix}prompt:${prompt.id}:${agent}`,
          label: `${prompt.label} (${agentNames[agent] ?? agent})`,
          action: 'agent-prompt',
          agent,
          prompt: prompt.body.trimEnd(),
          scope,
        })),
      ),
  ]
  const existing = (
    (await orcaCall(metadata, 'settings.getTerminalQuickCommands', null)) as {
      terminalQuickCommands: Array<QuickCommand>
    }
  ).terminalQuickCommands
  const ours = (entry: QuickCommand) => entry.id.startsWith(prefix) && entry.scope?.repoId === repo.id
  const removed = existing.filter((entry) => ours(entry) && !wanted.some((want) => want['id'] === entry.id))
  const others = existing.filter((entry) => !ours(entry)).length
  if (others + wanted.length > 40) {
    return `Orca: holds at most 40 quick commands and ${others} belong to other repos or were added by hand, so ${wanted.length} more do not fit. Nothing changed.`
  }
  if (!dryRun) {
    for (const entry of removed) {
      await orcaCall(metadata, 'settings.updateTerminalQuickCommands', { mutation: { type: 'delete', id: entry.id } })
    }
    for (const entry of wanted) {
      await orcaCall(metadata, 'settings.updateTerminalQuickCommands', { mutation: { type: 'upsert', command: entry } })
    }
  }
  return `Orca: ${wanted.length} quick commands for ${checkout}${removed.length > 0 ? `, ${removed.length} removed` : ''}.`
}

// --- OpenChamber -------------------------------------------------------------

const installOpenChamber = (): string => {
  const directory = join(homedir(), '.config', 'openchamber')
  if (!existsSync(directory)) return 'OpenChamber: not installed, skipped.'
  const prefix = `${manifest.name}:`
  const checkouts = [...new Set([root, mainCheckout()].map((path) => path.replace(/\\/g, '/').replace(/\/+$/, '')))]
  for (const checkout of checkouts) {
    // OpenChamber names a project's settings file after its path.
    const file = join(directory, 'projects', `path_${Buffer.from(checkout, 'utf8').toString('base64url')}.json`)
    const current = existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>) : {}
    const kept = (
      Array.isArray(current['projectActions']) ? (current['projectActions'] as Array<{ id: string }>) : []
    ).filter((entry) => !entry.id.startsWith(prefix))
    const actions = manifest.actions.map((action) => ({
      id: `${prefix}${action.id}`,
      name: action.label,
      command: `pnpm run ${action.script}`,
      ...(action.url === undefined ? {} : { autoOpenUrl: true, openUrl: action.url }),
    }))
    const primary = manifest.actions.find((action) => action.primary === true)
    const next = {
      ...current,
      ...(current['version'] === undefined ? { version: 1 } : {}),
      projectActions: [...kept, ...actions],
      ...(primary !== undefined && current['projectActionsPrimaryId'] === undefined
        ? { projectActionsPrimaryId: `${prefix}${primary.id}` }
        : {}),
      projectPath: checkout,
    }
    if (!dryRun) {
      mkdirSync(dirname(file), { recursive: true })
      writeFileSync(file, `${JSON.stringify(next, null, 2)}\n`)
    }
  }
  return `OpenChamber: ${manifest.actions.length} project actions for ${checkouts.join(' and ')}.`
}

// --- Commands ----------------------------------------------------------------

if (command === 'sync' || command === 'check') {
  const stale = syncPrompts(command === 'sync')
  if (command === 'check' && stale.length > 0) {
    console.error(
      `Agent commands are out of date with .agents/prompts (run pnpm run surfaces:sync):\n  ${stale.join('\n  ')}`,
    )
    process.exit(1)
  }
  console.log(stale.length === 0 ? 'Agent commands are up to date.' : `Wrote ${stale.length} agent command files.`)
} else if (command === 'install') {
  if (syncPrompts(false).length > 0) console.warn('Agent commands are out of date; run pnpm run surfaces:sync.')
  const prompts = readPrompts()
  console.log(await installOrca(prompts))
  console.log(installOpenChamber())
  if (dryRun) console.log('Dry run: nothing was written.')
} else {
  console.error('usage: node tools/dev/surfaces.ts sync | check | install [--dry-run]')
  process.exit(2)
}
