/**
 * @file apps/cli/src/index.ts
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

export { main, makeSmartcloud, run, runWith } from './cli.js'
export { checkCommitCommand, CommitCheckFailed, dryRunCommand, locateConfig, migrate, planSettingsCommand, syncCommand, UnknownAuthor, UnsafePath, validate } from './commands.js'
export { VERSION } from './version.js'
export { CONFIG_CANDIDATES, ConfigSourceFromGitHub, gitHubConfigSource, MissingToken, NoConfig, resolveToken } from '@resnovas/runtime'
