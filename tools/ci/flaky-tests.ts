// Synced from Resnovas/.github templates/tools/ci/flaky-tests.ts. Edit it there,
// not here: the next house sync overwrites local edits.
//
// Reports the tests that failed and then passed on a retry. vitest.shared.ts
// retries failed tests on CI and adds this reporter there, so a flaky test
// keeps the run green but shows up as a warning annotation on the run and the
// pull request, and in a table in the job summary, instead of passing silently.

import { appendFileSync } from 'node:fs'
import { relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Reporter, TestCase } from 'vitest/node'

const workspaceRoot = fileURLToPath(new URL('../..', import.meta.url))

interface Flaky {
  readonly project: string
  readonly file: string
  readonly line: number | undefined
  readonly name: string
  readonly retries: number
}

// Workflow command escaping, as in @actions/core.
const escapeData = (text: string) => text.replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A')
const escapeProperty = (text: string) => escapeData(text).replaceAll(':', '%3A').replaceAll(',', '%2C')
// Markdown table cells cannot hold a pipe or a line break.
const cell = (text: string) => text.replaceAll('|', '\\|').replaceAll(/\r?\n/g, ' ')
const times = (count: number) => (count === 1 ? '1 retry' : `${count} retries`)

export default class FlakyTestReporter implements Reporter {
  private readonly flaky: Array<Flaky> = []

  onTestCaseResult(testCase: TestCase) {
    const diagnostic = testCase.diagnostic()
    if (!diagnostic?.flaky) return
    const flaky: Flaky = {
      project: testCase.project.name,
      // Annotations need a path from the repository root, with forward slashes on Windows too.
      file: relative(workspaceRoot, testCase.module.moduleId).split(sep).join('/'),
      line: testCase.location?.line,
      name: testCase.fullName,
      retries: diagnostic.retryCount,
    }
    this.flaky.push(flaky)
    const line = flaky.line === undefined ? '' : `,line=${flaky.line}`
    console.log(
      `::warning file=${escapeProperty(flaky.file)}${line},title=${escapeProperty('Flaky test')}::${escapeData(
        `${flaky.name} (${flaky.project}) failed, then passed after ${times(flaky.retries)}.`,
      )}`,
    )
  }

  onTestRunEnd() {
    const summary = process.env['GITHUB_STEP_SUMMARY']
    const [first] = this.flaky
    if (first === undefined || !summary) return
    const rows = this.flaky.map(
      (flaky) =>
        `| \`${cell(flaky.file)}${flaky.line === undefined ? '' : `:${flaky.line}`}\` | ${cell(flaky.name)} | ${flaky.retries} |`,
    )
    appendFileSync(
      summary,
      [
        // Nx runs each test project in its own Vitest process, so one reporter sees one project.
        `### Flaky tests in ${first.project}`,
        '',
        'These tests failed, then passed on a retry. Fix or quarantine them; the retry only keeps the run green.',
        '',
        '| Test file | Test | Retries |',
        '| --- | --- | --- |',
        ...rows,
        '',
        '',
      ].join('\n'),
    )
  }
}
