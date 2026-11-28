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
// TASK_LINEAR_PREFIX in house sync.values opts a repository into paired
// Linear/GitHub issue references. Unmapped repositories default to none.
// This offline check verifies syntax, not remote mapping or acceptance.
//
// `node tools/dev/surfaces.mjs install` (run by setup) installs it as
// .git/hooks/commit-msg. It has no dependencies and never talks to the
// network. HOUSE_SKIP_COMMIT_CHECK=1 skips ordinary checks for an emergency
// commit, but never the generated-output guard. PR policy still applies.

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
// The Linear mirror paths preserve verbatim source, not human-authored prose.
const SKIP_PATH = /^(?:graphify-out\/|graphify-snapshot\/|externals\/|docs\/reference\/|docs\/planning\/issues\/|tools\/documentation\/linear-snapshot\.json$|LLMS\.md$|CHANGELOG\.md$|.*lock\.(?:yaml|json)$|.*\.(?:min\.js|map|svg|png|jpe?g|gif|pdf|woff2?|ttf|ico)$)/

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
 * @param {string} linearPrefix - Configured team key, or none for unmapped repositories.
 * @returns {string[]}
 */
export const checkMessage = (message, author, linearPrefix = 'none') => {
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

  // Opt in through the existing renderer, not by guessing tracker IDs from
  // branch names or contacting a tracker in a local commit hook.
  if (linearPrefix !== 'none') {
    if (!/^[A-Z][A-Z0-9]*$/.test(linearPrefix)) {
      problems.push('An invalid task Linear prefix was rendered; set TASK_LINEAR_PREFIX to the verified team key or none in house sync.values.')
    } else {
      const linear = new RegExp(`(?:^|[^A-Za-z0-9_-])${linearPrefix}-[1-9]\\d*(?![A-Za-z0-9_-])`)
      const github = /(?:^|[\s(,])(?:[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+#[1-9]\d*|https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/issues\/[1-9]\d*)(?=$|[\s),.;])/m
      if (!linear.test(text)) problems.push(`Reference the owning ${linearPrefix} issue in this task commit, including generated docs/graph commits; use a verified ID, never a placeholder.`)
      if (!github.test(text)) problems.push('Reference the verified linked, qualified GitHub issue as owner/repo#number or https://github.com/owner/repo/issues/number; a bare #number or pull request is not a mapping. Use Refs for partial delivery, not closing keywords.')
    }
  }

  const trailer = (key) =>
    trailers
      .filter((line) => line.toLowerCase().startsWith(`${key.toLowerCase()}: `))
      .map((line) => line.slice(key.length + 2).trim())

  // Before signing, identity text proves neither platform nor human consent.
  // An agent's matching trailer records provenance; PR certification is separate.
  const signOffs = trailer('Signed-off-by').map(parseIdentity).filter((identity) => identity !== undefined)
  if (!signOffs.some((signer) => signer.email === author.email.toLowerCase())) {
    problems.push(
      `No Signed-off-by matching the author <${author.email}>. Use git commit -s with your authorized identity. An agent's own trailer is provenance only and needs separate human PR certification. See ${POLICY}/AI_POLICY.md#ai-03`,
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
 * Bind a commit to its author's own GitHub-verified signing account.
 * A trusted CI adapter supplies immutable-commit API data. This pure
 * evaluator neither classifies authors nor runs in the pre-signature hook;
 * the same account-binding rule works without a per-tool fingerprint list.
 *
 * @param {object} commit - GitHub commit data, never candidate-authored evidence.
 * @param {object} commit.author - Git actor including its resolved user account.
 * @param {object|null} commit.signature - GitHub signature validity, state and signer.
 * @returns {string[]} Corrective failures; passing does not certify the human DCO.
 */
export const checkAuthorSignature = ({ author, signature }) => {
  const authorId = author?.user?.databaseId
  const signerId = signature?.signer?.databaseId
  if (signature?.isValid !== true || signature.state !== 'VALID' || !Number.isSafeInteger(authorId) || authorId <= 0 || signerId !== authorId) {
    return ['Sign with your own identity: require a VALID GitHub signature whose signer account matches the resolved author account. Agent-authored commits must use that agent account, not a human signing account.']
  }
  return []
}

/**
 * Evaluate human certification for PRs containing agent-authored commits.
 *
 * Pure policy only, not called by the pre-signature hook. A trusted CI adapter
 * must supply complete author classifications from trusted account policy,
 * configured human accounts, and complete authenticated GitHub review data.
 * No CI adapter is activated by this function.
 *
 * @param {object} evidence - Trusted normalized PR evidence, never PR-supplied JSON.
 * @param {string} evidence.headSha - Immutable PR head being certified.
 * @param {boolean} evidence.commitsComplete - Whether all PR commits were classified.
 * @param {string[]} evidence.commitKinds - agent, human or trusted-bot; unknown fails closed.
 * @param {string[]} [evidence.humanLogins] - Human certifiers from trusted policy, not the PR body.
 * @param {string} [evidence.accountableHuman] - Existing AI-21 accountable-human field.
 * @param {string} [evidence.humanReview] - Existing AI-21 human-review field.
 * @param {boolean} [evidence.reviewsComplete] - Whether every review page was read successfully.
 * @param {object[]} [evidence.reviews] - GitHub review objects, including id, state, commit_id, body and user.
 * @returns {string[]} Unsatisfied certification requirements; empty does not grant merge authority.
 */
export const checkPullRequestCertification = ({ headSha, commitsComplete, commitKinds, humanLogins, accountableHuman, humanReview, reviewsComplete, reviews }) => {
  if (commitsComplete !== true || !Array.isArray(commitKinds) || commitKinds.length === 0 || commitKinds.some((kind) => !['agent', 'human', 'trusted-bot'].includes(kind))) {
    return ['Classify every PR author using trusted account policy before deciding whether human PR certification is required.']
  }
  // Ordinary human sign-off and existing AI-21 gates remain independent.
  // GitHub forbids self-approval, so human-authored PRs do not use this path.
  if (!commitKinds.includes('agent')) return []
  const failure = ['Obtain an exact-head human DCO approval from the named accountable human. Agent sign-offs and PR description fields alone never certify the DCO.']
  const login = accountableHuman?.replace(/^@/, '').toLowerCase()
  if (!/^[a-f0-9]{40}$/.test(headSha ?? '') || !login || !humanReview?.trim() || reviewsComplete !== true || !Array.isArray(reviews)) return failure
  if (!humanLogins?.some((human) => human.toLowerCase() === login)) return failure
  const ownReviews = reviews.filter((review) => review.user?.login?.toLowerCase() === login)
  if (ownReviews.length === 0 || ownReviews.some((review) => !Number.isSafeInteger(review.id) || review.id <= 0)) return failure
  const latest = ownReviews.reduce((newest, review) => review.id > newest.id ? review : newest)
  const certificate = 'DCO certification: I certify the Developer Certificate of Origin for all changes in this pull request.'
  return latest.user.type === 'User' && latest.state === 'APPROVED' && latest.commit_id === headSha && latest.body?.trim() === certificate ? [] : failure
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

/**
 * Reject generated content before message exemptions or staged-text switches.
 * Only legacy local-output deletions and its two configuration files are ordinary changes.
 * Workflow context is an accident guard, not authentication; GitHub permissions,
 * signed automation PRs and required reviews/checks remain the security boundary.
 *
 * @param {string} message - Complete proposed commit message.
 * @returns {{ problems: string[], automation: boolean }} Guard decision without publishing its configured value.
 */
const checkGeneratedGraph = (message) => {
  const fields = git('diff', '--cached', '--name-status', '--no-renames', '-z').split('\0')
  const changes = []
  for (let i = 0; i + 1 < fields.length; i += 2) changes.push({ status: fields[i], path: fields[i + 1] })
  const generated = changes.filter(({ status, path }) => path.startsWith('graphify-snapshot/') ||
    (path.startsWith('graphify-out/') && !['graphify-out/.gitignore', 'graphify-out/.gitattributes'].includes(path) && status !== 'D'))
  if (generated.length === 0) return { problems: [], automation: false }
  const denied = { problems: ['Generated graph commits cause merge conflicts; graph updates are handled only by repository automation. Unstage generated output and commit source/configuration changes instead.'], automation: false }
  // No cache, local graph, source change, rename or deletion can ride the publisher exception.
  const outputs = ['graphify-snapshot/graph.json', 'graphify-snapshot/provenance.json']
  if (!changes.every(({ status, path }) => ['A', 'M'].includes(status) && outputs.includes(path))) return denied
  const env = process.env
  if (env.GITHUB_ACTIONS !== 'true' || !['schedule', 'workflow_dispatch'].includes(env.GITHUB_EVENT_NAME) ||
    !['Resnovas/Eventiva', 'Resnovas/.github'].includes(env.GITHUB_REPOSITORY) || env.GITHUB_REF !== 'refs/heads/main' ||
    env.GITHUB_WORKFLOW_REF !== `${env.GITHUB_REPOSITORY}/.github/workflows/house-graphify.yml@refs/heads/main`) return denied
  try {
    const event = JSON.parse(readFileSync(env.GITHUB_EVENT_PATH, 'utf8'))
    if (event.repository?.full_name !== env.GITHUB_REPOSITORY || event.repository?.default_branch !== 'main' ||
      git('symbolic-ref', '--short', 'HEAD').trim() !== 'main' || git('rev-parse', 'HEAD').trim() !== env.GITHUB_SHA) return denied
    // Read committed workflow configuration; an unstaged/staged edit cannot grant an exception.
    const workflow = git('show', 'HEAD:.github/workflows/house-graphify.yml')
    const values = [...workflow.matchAll(/^      publication-message: '([^'\r\n]+)'$/gm)]
    if (values.length !== 1 || message.replace(/\r?\n$/, '') !== values[0][1]) return denied
    const modes = git('ls-files', '--stage', '--', ...outputs).trim().split('\n')
    if (modes.length !== outputs.length || modes.some((entry) => !entry.startsWith('100644 ') || !/ 0\t/.test(entry))) return denied
    return { problems: [], automation: true }
  } catch {
    // Missing/malformed workflow evidence denies publication without leaking message or event data.
    return denied
  }
}

const main = () => {
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
  const graph = checkGeneratedGraph(message)
  if (graph.problems.length > 0) {
    for (const problem of graph.problems) console.error(`commit-check: ${problem}`)
    return 1
  }
  if (graph.automation || process.env['HOUSE_SKIP_COMMIT_CHECK'] === '1') return 0
  if (author === undefined) {
    // "Name <email> 1700000000 +0000"
    const ident = git('var', 'GIT_AUTHOR_IDENT').trim().replace(/\s+\d+\s+[+-]\d{4}$/, '')
    author = parseIdentity(ident)
    if (author === undefined) throw new Error(`cannot read the author from git: "${ident}"`)
  }
  // A merge or revert in progress stages already-reviewed changes; only the message is checked.
  if (scanDiff && ['MERGE_HEAD', 'REVERT_HEAD'].some((head) => existsSync(resolve(git('rev-parse', '--git-path', head).trim())))) scanDiff = false
  // Keep rendered configuration as data: even quotes/newlines cannot become
  // executable JavaScript before the team-key validation runs.
  const linearPrefix = readFileSync(new URL('./commit-check-linear-prefix.txt', import.meta.url), 'utf8').trim()
  const problems = [...checkMessage(message, author, linearPrefix), ...(scanDiff ? checkStagedText(git('diff', '--cached', '--unified=1', '--no-color')) : [])]
  for (const problem of problems) console.error(`commit-check: ${problem}`)
  if (problems.length > 0) console.error('commit-check: the commit was not made. Fix the message or the staged text, or set HOUSE_SKIP_COMMIT_CHECK=1 for an emergency commit; the pull request check still applies.')
  return problems.length === 0 ? 0 : 1
}

if (process.argv[1] !== undefined && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  process.exit(main())
}
