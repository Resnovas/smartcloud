import * as core from '@actions/core'
import { log } from '..'
import { Condition } from '../conditions'
import evaluator, { ConditionSetType } from '../conditions/evaluator'
import {
  issueConfig,
  IssueContext,
  PRContext,
  pullRequestConfig
} from '../types'
import { semantic } from './helper/semantic'

export function enforceConventions(
  type: 'pr' | 'issue',
  enforceConventions:
    | pullRequestConfig['enforceConventions']
    | issueConfig['enforceConventions'],
  context: PRContext | IssueContext
) {
  if (!enforceConventions || !enforceConventions.conventions)
    throw new Error('No enforceable conventions')
  let required = 0,
    successful = 0,
    failedMessages: string[] = []
  enforceConventions.conventions.forEach(convention => {
    if (!convention.conditions) return
    required++
    if (convention.conditions == 'semanticTitle') {
      convention.requires = 1
      let conditions: Condition[] = []
      semantic.forEach(pattern => {
        conditions.push({
          type: 'titleMatches',
          pattern: `/^${pattern}(\\(.*\\))?:/i`
        })
      })
      if (convention.contexts) {
        convention.requires++
        convention.contexts.forEach(pattern => {
          conditions.push({
            type: 'titleMatches',
            pattern: `/\\(${pattern}\\):/i`
          })
        })
      }
      convention.failedComment =
        `Semantic Conditions failed - Please title your PR using one of the valid options: ` +
        semantic.toString()
      convention.conditions = conditions
    }
    if (
      //@ts-ignore
      evaluator(ConditionSetType[type], convention, context[`${type}Props`])
    ) {
      successful++
    } else {
      failedMessages.push(convention.failedComment)
    }
  })

  if (required > successful) {
    failedMessages.forEach(fail => core.setFailed(fail))
    return false
  }
  log(`All conventions successfully enforced. Moving to next step`, 2)
  return true
}
