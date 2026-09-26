/**
 * @file tests/feature.settings/src/fixtures.ts
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

import type { SettingsConfig } from '@resnovas/feature.settings'
import type { Repository } from '@resnovas/integrations.github'

// The house baseline from Resnovas/.github GOVERNANCE.md ("Merging" and
// "Repository settings"), written as a declarative settings section.

export const houseSettings: SettingsConfig = {
  merging: {
    mergeCommit: false,
    squash: true,
    rebase: true,
    autoMerge: true,
    updateBranch: true,
    deleteBranchOnMerge: true,
    webCommitSignoff: true,
    squashTitle: 'PR_TITLE',
    squashMessage: 'COMMIT_MESSAGES',
  },
  features: { wiki: false, discussions: true, sponsorships: true },
  security: {
    immutableReleases: true,
    privateVulnerabilityReporting: true,
    dependabotAlerts: true,
    dependabotSecurityUpdates: true,
    codeScanning: 'extended',
    secretScanning: true,
  },
  ruleset: {
    linearHistory: true,
    blockDeletion: true,
    blockForcePush: true,
    copilotReview: true,
    codeScanningGate: true,
    requiredChecks: ['house-policy / policy', 'house-policy / reviews'],
  },
  environments: { projectType: 'saas' },
}

export const soleMaintainer = { maintainers: ['TGTGamer'] }
export const twoMaintainers = { maintainers: ['TGTGamer', 'second'] }

export const publicRepository: Repository = {
  owner: 'Resnovas',
  name: 'example',
  fullName: 'Resnovas/example',
  nodeId: 'R_1',
  private: false,
  defaultBranch: 'main',
}

export const privateRepository: Repository = { ...publicRepository, private: true }
