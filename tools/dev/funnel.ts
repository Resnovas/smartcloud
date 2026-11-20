/**
 * @file tools/dev/funnel.ts
 *
 * Copyright 2026 Jonathan Stevens trading as Resnovas. All rights reserved.
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

import { spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const marker = '# smartcloud-funnel pre-commit'
const hook = `#!/bin/sh\n${marker}\nexec node --run funnel:pre-commit\n`

/** Run Git without a shell so paths and hook configuration cannot become shell input. */
const git = (...args: string[]) => spawnSync('git', args, { encoding: 'utf8' })

/** Fail closed when Git or a check cannot run; report the failed phase to the caller. */
const fail = (message: string): never => {
  console.error(`funnel: ${message}`)
  process.exit(1)
}

/** Identify the index Git will commit, including a hook's temporary or alternate index. */
const stagedTree = (): string => {
  const result = git('write-tree')
  if (result.status !== 0) fail(`Cannot read the staged tree: ${result.stderr}`)
  return result.stdout.trim()
}

/** Keep every phase bound to the original index and the source files its checks read. */
const checkSnapshot = (expectedTree: string, phase: string): void => {
  if (stagedTree() !== expectedTree) {
    fail(`Staged tree changed ${phase}. Review the generated changes, stage the intended tree and rerun verification.`)
  }
  if (git('diff', '--quiet').status !== 0) {
    fail(
      `Unstaged tracked changes ${phase} would verify a different tree. Stage the intended change or commit from a clean task worktree; no files were restored.`,
    )
  }
  const untracked = git('ls-files', '--others', '--exclude-standard')
  if (untracked.status !== 0) fail(`Cannot inspect untracked files ${phase}: ${untracked.stderr}`)
  if (untracked.stdout.trim() !== '')
    fail(
      `Untracked files ${phase} could affect verification. Stage intended files or move scratch files outside the source tree.`,
    )
}

if (process.argv.includes('--install')) {
  const result = git('rev-parse', '--git-path', 'hooks/pre-commit')
  if (result.status !== 0) fail(`Cannot locate Git hooks: ${result.stderr}`)
  const path = resolve(result.stdout.trim())
  mkdirSync(dirname(path), { recursive: true })
  try {
    // Exclusive creation cannot overwrite a hook replaced concurrently or follow a dangling symlink.
    writeFileSync(path, hook, { flag: 'wx', mode: 0o755 })
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'EEXIST')) {
      fail(`Cannot create hook ${path}: ${String(error)}`)
    }
    try {
      if (readFileSync(path, 'utf8') !== hook) {
        fail(
          `Preserving existing hook ${path}. Automatic setup requires ownership of this hook. Ask its owner to preserve and relocate it before rerunning setup; do not overwrite it or bypass its checks.`,
        )
      }
    } catch (readError) {
      fail(`Preserving existing hook ${path}; cannot read it: ${String(readError)}`)
    }
  }
  console.log('funnel: pre-commit installed')
} else {
  // Tests inspect the worktree. Refuse a different staged snapshot rather than
  // stashing somebody's edits or reporting a false green for a partial commit.
  const expectedTree = stagedTree()
  checkSnapshot(expectedTree, 'before verification')
  const localEnv = git('rev-parse', '--local-env-vars')
  if (localEnv.status !== 0) fail(`Cannot identify Git-local environment variables: ${localEnv.stderr}`)
  const childEnv = { ...process.env }
  for (const name of localEnv.stdout.trim().split('\n')) delete childEnv[name]
  for (const script of ['funnel:static', 'funnel:verify']) {
    // Only children are isolated: our Git inspections must retain the committing index.
    const result = spawnSync(process.execPath, ['--run', script], { stdio: 'inherit', env: childEnv })
    checkSnapshot(expectedTree, `after ${script}`)
    if (result.status !== 0) fail(`${script} failed; fix the reported error and rerun it before committing.`)
  }
  console.log('funnel: static analysis and verification passed for the staged tree')
}
