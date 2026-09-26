/**
 * @file eslint.config.mjs
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

import nx from '@nx/eslint-plugin'

// House module boundaries (coding-preferences, references/architecture.md):
// types only depend downwards (core, shared, database, extension, platform),
// layers never cross between backend and frontend, and test projects may
// depend on anything they test.
const typeConstraints = [
  { sourceTag: 'type_core', onlyDependOnLibsWithTags: ['type_core'] },
  { sourceTag: 'type_shared', onlyDependOnLibsWithTags: ['type_core', 'type_shared'] },
  { sourceTag: 'type_database', onlyDependOnLibsWithTags: ['type_core', 'type_shared', 'type_database'] },
  { sourceTag: 'type_extension', onlyDependOnLibsWithTags: ['type_core', 'type_shared', 'type_extension'] },
  {
    sourceTag: 'type_platform',
    onlyDependOnLibsWithTags: ['type_core', 'type_shared', 'type_database', 'type_extension', 'type_platform'],
  },
  { sourceTag: 'type_test', onlyDependOnLibsWithTags: ['*'] },
]

const layerConstraints = [
  { sourceTag: 'layer_shared', onlyDependOnLibsWithTags: ['layer_shared'] },
  { sourceTag: 'layer_backend', onlyDependOnLibsWithTags: ['layer_backend', 'layer_shared'] },
  { sourceTag: 'layer_frontend', onlyDependOnLibsWithTags: ['layer_frontend', 'layer_shared'] },
]

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/release',
      '**/out-tsc',
      '**/coverage',
      '**/vitest.config.*.timestamp*',
      'graphify-out/**',
      'externals/**',
    ],
  },
  {
    files: ['**/*.ts', '**/*.mts', '**/*.js', '**/*.mjs'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          // Workspace config shared by every project: the ESLint config and the
          // Vitest preset in vitest.shared.ts.
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$', '^.*/vitest\\.shared(\\.[jt]s)?$'],
          depConstraints: [...typeConstraints, ...layerConstraints],
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
]
