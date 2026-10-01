#!/usr/bin/env node
// Synced from Resnovas/.github templates/tools/dev/commit-check.mjs. Edit it
// there, not here: the next house sync overwrites local edits.
//
// Checks a commit message, and the staged text, against the house commit
// rules before the commit exists (house standard commits-and-rd-evidence,
// AI_POLICY.md AI-02, AI-03 and AI-09, CONTRIBUTING.md#Commits), and added
// TypeScript source lines against the house code standard (coding-preferences,
// references/effect.md: Effect-TS, no plain Promise code outside a marked
// vendor boundary, no `any`).
//
//   node tools/dev/commit-check.mjs <message-file>        the commit-msg hook
//   node tools/dev/commit-check.mjs --message "<text>"     check a message
//     --author "Name <email>"   the author to check against; git's by default
//     --no-diff                 skip the staged-text scan
//
// `node tools/dev/surfaces.mjs install` (run by setup) installs it as
// .git/hooks/commit-msg. It has no dependencies and never talks to the
// network. HOUSE_SKIP_COMMIT_CHECK=1 skips it for one emergency commit; the
// smartcloud check on the pull request still applies every rule.

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const POLICY = 'https://github.com/Resnovas/.github/blob/main'

// The same AI identity patterns smartcloud uses (packages/feature.commits).
const AI_EMAIL = /(?:@anthropic\.com|@openai\.com|@cursor\.(?:com|sh)|copilot|\.invalid)$/i
const AI_NAME = /\b(?:claude|codex|chatgpt|gpt-?\d|copilot|cursor|gemini|devin|aider|windsurf|jules|codeium|tabnine)\b/i
const isAi = ({ name, email }) => AI_EMAIL.test(email) || AI_NAME.test(name)

const TYPES = 'feat|fix|perf|refactor|test|docs|chore|build|ci|style|revert'
const CONVENTIONAL = new RegExp(`^(?:${TYPES})(?:\\([\\w./-]+\\))?!?: \\S`)
const LONG_DASH = /[\u2013\u2014]/
const EMOJI = /\p{Extended_Pictographic}/u
// Lines a host adds on its own that are not the credit AI-02 asks for.
const HOST_LINE = /^(?:claude-session|made-with|generated-by|generated with|🤖)/i

// Staged files the dash scan leaves alone: generated, vendored or not text.
const SKIP_PATH = /^(?:graphify-out\/|externals\/|docs\/reference\/|LLMS\.md$|CHANGELOG\.md$|.*lock\.(?:yaml|json)$|.*\.(?:min\.js|map|svg|png|jpe?g|gif|pdf|woff2?|ttf|ico)$)/

// TypeScript the code scan covers: sources, not tests, typings, vendored code
// or repository tooling (coding-preferences, references/effect.md).
const TS_PATH = /\.tsx?$/
const TS_SKIP_DIRECTORY = /(?:^|\/)(?:tests?|__tests__|scripts|tools)\//
const TS_SKIP_FILE = /\.(?:test|spec|d)\.tsx?$/
const isSource = (file) => TS_PATH.test(file) && !TS_SKIP_DIRECTORY.test(file) && !TS_SKIP_FILE.test(file)
const ANY_TYPE = /(?::\s*any\b|\bas\s+any\b|<any[\s,>]|\bany\[\])/
const PLAIN_PROMISE = /\basync\b|\bawait\b|\btry\s*\{|\bthrow\b|\bnew\s+Promise\b|\.then\(/
const EFFECT_CALL = /\bEffect\./
const BOUNDARY = /effect-boundary:/
const COMMENT_LINE = /^\s*(?:\/\/|\/?\*)/
// Git-generated subjects: the merge queue, rebase tooling and git itself write these.
const GIT_GENERATED = /^(?:Merge |fixup! |squash! |Revert ")/
// Everything after git's verbose-commit cut line is the diff, not the message.
const CUT_LINE = /^# -+ >8 -+$/m
// String literals are not code: `"async"` in a label is not an async function.
const STRINGS = /(["'`])(?:\\.|(?!\1).)*\1/g
const withoutStrings = (text) => text.replace(STRINGS, '""')
// Nor are comments after code, block comments or JSX text.
const codeOnly = (text) => withoutStrings(text).replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, ' ').replace(/>[^<>]*</g, '><')

/**
 * Parses "Name <email>".
 *
 * @param {string} text
 * @returns {{ name: string, email: string } | undefined}
 */
const parseIdentity = (text) => {
  const match = /^\s*(.*?)\s*<([^>]+)>\s*$/.exec(text)
  return match ? { name: match[1], email: match[2].toLowerCase() } : undefined
}

/**
 * Splits a message into its subject, body lines and trailers.
 *
 * @param {string} message
 */
const parseMessage = (message) => {
  const cut = CUT_LINE.exec(message)
  const lines = (cut ? message.slice(0, cut.index) : message)
    .split('\n')
    .filter((line) => !line.startsWith('#'))
    .map((line) => line.trimEnd())
  while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop()
  const subject = lines[0] ?? ''
  // The trailer block is the last paragraph when every line in it is a trailer.
  let start = lines.length
  while (start > 0 && lines[start - 1] !== '') start -= 1
  const last = lines.slice(start)
  const isTrailer = (line) => /^[A-Za-z][\w-]*: /.test(line) || /^\s+\S/.test(line)
  const trailers = start > 0 && last.length > 0 && last.every(isTrailer) ? last : []
  return { subject, lines, trailers }
}

/**
 * The rules a message and author break.
 *
 * @param {string} message
 * @param {{ name: string, email: string }} author
 * @returns {string[]}
 */
export const checkMessage = (message, author) => {
  const problems = []
  const { subject, lines, trailers } = parseMessage(message)
  const text = lines.join('\n')

  if (subject !== '' && !GIT_GENERATED.test(subject) && !CONVENTIONAL.test(subject)) {
    problems.push(
      `Subject "${subject}" is not a conventional commit: <type>(<scope>): <summary>, with type one of ${TYPES.replaceAll('|', ', ')}. See ${POLICY}/CONTRIBUTING.md#Commits`,
    )
  }
  if (LONG_DASH.test(text)) problems.push(`The message contains an em or en dash; use ordinary punctuation (AI-09). See ${POLICY}/AI_POLICY.md#ai-09`)
  if (EMOJI.test(text)) problems.push(`The message contains emoji (AI-09). See ${POLICY}/AI_POLICY.md#ai-09`)
  // A merge, revert, fixup or squash commit is git's own: no sign-off or credit to check
  // (the pull request check exempts merge commits too, and fixups never land).
  if (subject === '' || GIT_GENERATED.test(subject)) return [...new Set(problems)]

  const trailer = (key) =>
    trailers
      .filter((line) => line.toLowerCase().startsWith(`${key.toLowerCase()}: `))
      .map((line) => line.slice(key.length + 2).trim())

  if (isAi(author)) {
    problems.push(
      `The commit author "${author.name} <${author.email}>" is an AI tool. Set the author to the accountable human: git -c user.name="Name" -c user.email="you@example.com" commit ..., or GIT_AUTHOR_NAME and GIT_AUTHOR_EMAIL. See ${POLICY}/AI_POLICY.md#ai-03`,
    )
  }
  const signOffs = trailer('Signed-off-by').map(parseIdentity).filter((identity) => identity !== undefined)
  for (const signer of signOffs) {
    if (isAi(signer)) problems.push(`Signed-off-by "${signer.name} <${signer.email}>" names an AI tool; only a person certifies the DCO (AI-03). See ${POLICY}/AI_POLICY.md#ai-03`)
  }
  if (!signOffs.some((signer) => !isAi(signer) && signer.email === author.email)) {
    problems.push(
      `No Signed-off-by matching the author <${author.email}>. Commit with git commit -s as the accountable human; an agent adds someone's sign-off only where they set it up. See ${POLICY}/CONTRIBUTING.md#dco`,
    )
  }
  for (const value of trailer('Co-authored-by')) {
    const coAuthor = parseIdentity(value)
    if (coAuthor === undefined) {
      problems.push(`Co-authored-by "${value}" is not "Name <email>".`)
    } else if (isAi(coAuthor) && coAuthor.name.trim().split(/\s+/).length < 2) {
      problems.push(
        `Co-authored-by "${coAuthor.name}" names a tool family, not the model. Name both, for example "Claude Opus 5.5" (AI-02). See ${POLICY}/AI_POLICY.md#ai-02`,
      )
    }
  }
  for (const line of trailers.concat(lines.filter((line) => HOST_LINE.test(line)))) {
    if (HOST_LINE.test(line))
      problems.push(`Remove the host attribution line "${line.trim()}"; the Co-authored-by trailer and the sign-off are the only attribution (AI-02). See ${POLICY}/AI_POLICY.md#ai-02`)
  }
  return [...new Set(problems)]
}

/**
 * Problems in the added lines of the staged diff, by file: an em or en dash
 * anywhere, and in TypeScript sources an `any` or plain Promise code outside
 * a marked vendor boundary. One report per file and kind.
 *
 * @param {string} diff - `git diff --cached --unified=1` output.
 * @returns {string[]}
 */
export const checkStagedText = (diff) => {
  const problems = []
  const seen = new Set()
  const report = (kind, text) => {
    if (seen.has(kind)) return
    seen.add(kind)
    problems.push(text)
  }
  let file = ''
  let skip = false
  let source = false
  let boundary = false
  for (const line of diff.split('\n')) {
    if (line.startsWith('+++ ')) {
      file = line.slice(4).replace(/^b\//, '')
      skip = file === '/dev/null' || SKIP_PATH.test(file)
      source = !skip && isSource(file)
      boundary = false
      continue
    }
    if (skip) continue
    if (line.startsWith(' ')) {
      boundary = BOUNDARY.test(line)
      continue
    }
    if (!line.startsWith('+') || line.startsWith('+++')) continue
    const text = line.slice(1)
    if (LONG_DASH.test(text))
      report(`${file}:dash`, `${file}: an added line contains an em or en dash; use ASCII hyphen-minus in agent-authored text (house standard no-em-or-en-dashes).`)
    if (source && !COMMENT_LINE.test(text)) {
      const code = codeOnly(text)
      if (ANY_TYPE.test(code))
        report(`${file}:any`, `${file}: an added line uses \`any\`; use unknown with a type guard, a precise generic, a Schema or a branded type (coding-preferences, references/language.md).`)
      if (PLAIN_PROMISE.test(code) && !EFFECT_CALL.test(code) && !BOUNDARY.test(text) && !boundary)
        report(`${file}:promise`, `${file}: an added line has plain async/await, try/catch, throw, Promise or .then; write it as an Effect (Effect.tryPromise, Effect.try, Effect.fail with a Data.TaggedError), or mark the one vendor boundary with "// effect-boundary: <reason>" on the line above (coding-preferences, references/effect.md).`)
    }
    boundary = BOUNDARY.test(text)
  }
  return problems
}

// A staged diff can run to many megabytes when a batch adds documentation,
// so the buffer is well above Node's default of one megabyte.
const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 })

const main = () => {
  if (process.env['HOUSE_SKIP_COMMIT_CHECK'] === '1') return 0
  const args = process.argv.slice(2)
  let message
  let author
  let scanDiff = true
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg === '--message') message = args[++i]
    else if (arg === '--author') author = parseIdentity(args[++i] ?? '')
    else if (arg === '--no-diff') scanDiff = false
    else if (message === undefined) message = readFileSync(arg, 'utf8')
    else throw new Error(`unexpected argument: ${arg}`)
  }
  if (message === undefined) {
    console.error('usage: node tools/dev/commit-check.mjs <message-file> | --message "<text>" [--author "Name <email>"] [--no-diff]')
    return 2
  }
  if (author === undefined) {
    // "Name <email> 1700000000 +0000"
    const ident = git('var', 'GIT_AUTHOR_IDENT').trim().replace(/\s+\d+\s+[+-]\d{4}$/, '')
    author = parseIdentity(ident)
    if (author === undefined) throw new Error(`cannot read the author from git: "${ident}"`)
  }
  // A merge or revert in progress stages already-reviewed changes; only the message is checked.
  if (scanDiff && ['MERGE_HEAD', 'REVERT_HEAD'].some((head) => existsSync(resolve(git('rev-parse', '--git-path', head).trim())))) scanDiff = false
  const problems = [...checkMessage(message, author), ...(scanDiff ? checkStagedText(git('diff', '--cached', '--unified=1', '--no-color')) : [])]
  for (const problem of problems) console.error(`commit-check: ${problem}`)
  if (problems.length > 0) console.error('commit-check: the commit was not made. Fix the message or the staged text, or set HOUSE_SKIP_COMMIT_CHECK=1 for an emergency commit; the pull request check still applies.')
  return problems.length === 0 ? 0 : 1
}

if (process.argv[1] !== undefined && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  process.exit(main())
}
