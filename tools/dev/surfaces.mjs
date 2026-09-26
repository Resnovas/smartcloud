#!/usr/bin/env node
// Synced from Resnovas/.github templates/tools/dev/surfaces.mjs. Edit it there,
// not here: the next house sync overwrites local edits.
//
// Keeps the one-click surfaces that editors and agent apps cannot read from
// the repository in step with it (house standard project-dev-surfaces).
//
//   node tools/dev/surfaces.mjs sync      write the agent commands from .agents/prompts
//   node tools/dev/surfaces.mjs check     exit 1 if the agent commands are out of date
//   node tools/dev/surfaces.mjs install   register actions and prompts in Orca and OpenChamber
//   node tools/dev/surfaces.mjs install --dry-run
//
// `.agents/surfaces.json` (JSON with comments) lists the actions: the synced
// `house` list and the repository's own `actions`. Each runs a package script
// through `node --run`, or a `command`. `agents` get a button per prompt.
// `.agents/prompts/<id>.md` holds each prompt once, the house ones synced and
// the repository's own beside them; `sync` writes it to `.claude/commands`, `.cursor/commands` and
// `.opencode/commands`, which this tool owns outright.
//
// Orca keeps quick commands, and OpenChamber keeps project actions, in
// per-user settings rather than in the repository, so `install` writes them
// there for this checkout. It only touches entries whose id starts with the
// repository's name, so it never removes anything added by hand. It reads Orca's
// runtime token from Orca's own metadata file at run time and never stores it.

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createConnection } from 'node:net'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'




const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
// JSON with comments and trailing commas, as editors write it. Strings are
// copied whole, so a `//` inside one is kept.
const parseJsonc = (text) => {
  let out = ''
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === '"') {
      let end = i + 1
      while (end < text.length && text[end] !== '"') end += text[end] === '\\' ? 2 : 1
      out += text.slice(i, end + 1)
      i = end
    } else if (char === '/' && text[i + 1] === '/') {
      while (i < text.length && text[i] !== '\n') i++
      out += '\n'
    } else out += char
  }
  return JSON.parse(out.replace(/,(\s*[\]}])/g, '$1'))
}

const manifest = parseJsonc(readFileSync(join(root, '.agents/surfaces.json'), 'utf8'))
const actions = [...(manifest.house ?? []), ...(manifest.actions ?? [])]
// Every entry this tool writes starts with the repository's name, so it only
// ever replaces or removes its own.
const prefix = `${manifest.repository.split('/').pop()}:`
const commandOf = (action) => action.command ?? `node --run ${action.script}`
const [command, ...flags] = process.argv.slice(2)
const dryRun = flags.includes('--dry-run')

const agentNames = {
  claude: 'Claude',
  codex: 'Codex',
  opencode: 'OpenCode',
  gemini: 'Gemini',
  cursor: 'Cursor',
}

// --- Prompts -----------------------------------------------------------------

const readPrompts = () => {
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
          return colon === -1 ? [] : [[line.slice(0, colon).trim(), line.slice(colon + 1).trim()]]
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

const frontmatter = (fields) => {
  const lines = fields.flatMap(([key, value]) => (value === undefined || value === '' ? [] : [`${key}: ${value}`]))
  return lines.length === 0 ? '' : `---\n${lines.join('\n')}\n---\n\n`
}

// Each agent command directory maps a prompt to that tool's file format.
const targets = [
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
const syncPrompts = (write) => {
  const prompts = readPrompts()
  const stale = []
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



const orcaUserData = () => {
  if (process.env.ORCA_USER_DATA_PATH) return process.env.ORCA_USER_DATA_PATH
  if (process.platform === 'darwin') return join(homedir(), 'Library', 'Application Support', 'orca')
  if (process.platform === 'win32') return join(process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming'), 'orca')
  return join(process.env.XDG_CONFIG_HOME ?? join(homedir(), '.config'), 'orca')
}

const orcaCall = (metadata, method, params) =>
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
    socket.on('data', (chunk) => {
      buffer += chunk
      let newline = buffer.indexOf('\n')
      while (newline !== -1) {
        const line = buffer.slice(0, newline).trim()
        buffer = buffer.slice(newline + 1)
        newline = buffer.indexOf('\n')
        if (line === '') continue
        const frame = JSON.parse(line)
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

const mainCheckout = () => {
  const common = execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], {
    cwd: root,
    encoding: 'utf8',
  }).trim()
  return dirname(common)
}

const samePath = (left, right) => {
  const normalise = (path) => path.replace(/\\/g, '/').replace(/\/+$/, '')
  return process.platform === 'win32'
    ? normalise(left).toLowerCase() === normalise(right).toLowerCase()
    : normalise(left) === normalise(right)
}

const installOrca = async (prompts) => {
  const metadataPath = join(orcaUserData(), 'orca-runtime.json')
  if (!existsSync(metadataPath)) return 'Orca: not installed or never started, skipped.'
  const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'))
  let repos
  try {
    repos = (await orcaCall(metadata, 'repo.list', null)).repos
  } catch {
    return 'Orca: not running, skipped. Start Orca and run this again.'
  }
  const checkout = mainCheckout()
  const repo = repos.find((entry) => samePath(entry.path, checkout) || samePath(entry.path, root))
  if (repo === undefined) return `Orca: ${checkout} is not added to Orca, skipped. Add it, then run this again.`

  const scope = { type: 'repo', repoId: repo.id }
  const wanted = [
    ...actions.map((action) => ({
      id: `${prefix}${action.id}`,
      label: action.label,
      action: 'terminal-command',
      command: commandOf(action),
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
  const existing = (await orcaCall(metadata, 'settings.getTerminalQuickCommands', null)).terminalQuickCommands
  const ours = (entry) => entry.id.startsWith(prefix) && entry.scope?.repoId === repo.id
  const removed = existing.filter((entry) => ours(entry) && !wanted.some((want) => want.id === entry.id))
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

const installOpenChamber = () => {
  const directory = join(homedir(), '.config', 'openchamber')
  if (!existsSync(directory)) return 'OpenChamber: not installed, skipped.'
  const checkouts = [...new Set([root, mainCheckout()].map((path) => path.replace(/\\/g, '/').replace(/\/+$/, '')))]
  for (const checkout of checkouts) {
    // OpenChamber names a project's settings file after its path.
    const file = join(directory, 'projects', `path_${Buffer.from(checkout, 'utf8').toString('base64url')}.json`)
    const current = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {}
    const kept = (Array.isArray(current.projectActions) ? current.projectActions : []).filter((entry) => !entry.id.startsWith(prefix))
    const projectActions = actions.map((action) => ({
      id: `${prefix}${action.id}`,
      name: action.label,
      command: commandOf(action),
      ...(action.url === undefined ? {} : { autoOpenUrl: true, openUrl: action.url }),
    }))
    const primary = actions.find((action) => action.primary === true)
    const next = {
      ...current,
      ...(current.version === undefined ? { version: 1 } : {}),
      projectActions: [...kept, ...projectActions],
      ...(primary !== undefined && current.projectActionsPrimaryId === undefined
        ? { projectActionsPrimaryId: `${prefix}${primary.id}` }
        : {}),
      projectPath: checkout,
    }
    if (!dryRun) {
      mkdirSync(dirname(file), { recursive: true })
      writeFileSync(file, `${JSON.stringify(next, null, 2)}\n`)
    }
  }
  return `OpenChamber: ${actions.length} project actions for ${checkouts.join(' and ')}.`
}

// --- Commands ----------------------------------------------------------------

if (command === 'sync' || command === 'check') {
  const stale = syncPrompts(command === 'sync')
  if (command === 'check' && stale.length > 0) {
    console.error(
      `Agent commands are out of date with .agents/prompts (run node tools/dev/surfaces.mjs sync):\n  ${stale.join('\n  ')}`,
    )
    process.exit(1)
  }
  console.log(stale.length === 0 ? 'Agent commands are up to date.' : `Wrote ${stale.length} agent command files.`)
} else if (command === 'install') {
  if (syncPrompts(false).length > 0) console.warn('Agent commands are out of date; run node tools/dev/surfaces.mjs sync.')
  const prompts = readPrompts()
  console.log(await installOrca(prompts))
  console.log(installOpenChamber())
  if (dryRun) console.log('Dry run: nothing was written.')
} else {
  console.error('usage: node tools/dev/surfaces.mjs sync | check | install [--dry-run]')
  process.exit(2)
}
