import fs from 'fs'
import * as github from '@actions/github'
import { GitHub } from '@actions/github'
import { Config, Label, Options } from '../types'
import { contextHandler } from './contextHandler'
import { applyIssue, applyPR } from './labelHandler'
import { CurContext } from './conditions'
import { log } from '.'
import { utils } from './utils'
import { loggingData } from '@videndum/utilities'

let local: any
let context = github.context

try {
  local = require('../config.json')
  process.env.GITHUB_REPOSITORY = local.GITHUB_REPOSITORY
  process.env.GITHUB_REPOSITORY_OWNER = local.GITHUB_REPOSITORY_OWNER
  if (!context.payload.issue && !context.payload.pull_request)
    context = require(local.github_context)
} catch {}

/**
 * Super Labeler
 * @method Run The function called by ./index to run the Action
 * @method _log Logging to console
 * @author IvanFon, TGTGamer
 * @since 1.0.0
 */
export default class labelMastermind {
  client: GitHub
  opts: Options
  configJSON: Options['configJSON']
  configPath: Options['configPath']
  dryRun: Options['dryRun']
  repo = context.repo || {}

  /**
   * @author IvanFon, TGTGamer, jbinda
   * @since 1.0.0
   */
  constructor(client: GitHub, options: Options) {
    log(new loggingData('100', `Superlabeller Constructed: ${options}`))
    this.client = client
    this.opts = options
    this.configJSON = options.configJSON
    this.configPath = options.configPath
    this.dryRun = options.dryRun
  }

  /**
   * Runs the Action
   * @author IvanFon, TGTGamer, jbinda
   * @since 1.0.0
   */
  async run() {
    if (this.dryRun) this.repo.repo = process.env.GITHUB_REPOSITORY || 'Unknown'
    if (this.dryRun)
      this.repo.owner = process.env.GITHUB_REPOSITORY_OWNER || 'Unknown'
    log(
      new loggingData('100', `Repo data: ${this.repo.owner}/${this.repo.repo}`)
    )

    /**
     * Capture and log context to debug for Local Running
     * @author TGTGamer
     * @since 1.0.0
     */
    log(
      new loggingData(
        '100',
        `Context for local running. See readme.md for information on how to setup local running: ${JSON.stringify(
          context
        )}`
      )
    )

    /**
     * Process the config
     * @author TGTGamer
     * @since 1.1.0
     */
    const configs = await this.processConfig().catch(err => {
      throw new loggingData(
        '500',
        `Error thrown while processing config: `,
        err
      )
    })
    if (!configs) {
      throw new loggingData('500', `No config data.`)
    }
    log(new loggingData('100', `Config: ${JSON.stringify(configs)}`))

    /**
     * Get the context
     * @author TGTGamer
     * @since 1.1.0
     */
    const curContext = await this.processContext(configs).catch(err => {
      throw new loggingData(
        '500',
        `Error thrown while processing context: `,
        err
      )
    })

    /**
     * Combine the Shared & Context.type Configs
     * @author TGTGamer
     * @since 1.1.0
     */
    for (const config in configs.shared) {
      if (!configs[curContext.type].labels[config]) {
        configs[curContext.type].labels[config] = configs.shared[config]
      }
    }

    /**
     * Convert label ID's to Names
     * @author TGTGamer
     * @since 1.1.0
     */
    const labelIdToName = await Object.entries(configs.labels).reduce(
      (acc: { [key: string]: string }, cur) => {
        acc[cur[0]] = cur[1].name
        return acc
      },
      {}
    )

    /**
     * Syncronise the labels
     * @author TGTGamer
     * @since 1.1.0
     */
    await this.syncLabels(configs).catch(err => {
      throw new loggingData(
        '500',
        `Error thrown while syncronising labels: `,
        err
      )
    })

    /**
     * Apply the context
     * @author TGTGamer
     * @since 1.1.0
     */
    await this.applyContext(curContext, configs, labelIdToName).catch(err => {
      throw new loggingData('500', `Error thrown while applying context: `, err)
    })
  }

  /**
   * Get the configuration
   * @author IvanFon, TGTGamer, jbinda
   * @since 1.0.0
   */
  async processConfig(): Promise<Config> {
    if (!this.configJSON?.labels) {
      if (!fs.existsSync(this.configPath)) {
        throw new loggingData('500', `config not found at "${this.configPath}"`)
      }
      const pathConfig = JSON.parse(fs.readFileSync(this.configPath).toString())
      if (!pathConfig.labelMastermind) return pathConfig
      else return pathConfig.labelMastermind
    } else {
      return this.configJSON
    }
  }

  /**
   * Handle the context
   * @author IvanFon, TGTGamer, jbinda
   * @since 1.0.0
   */
  async processContext(config: Config) {
    let curContext: CurContext

    if (context.payload.pull_request) {
      /**
       * Pull Request Context
       * @author IvanFon, TGTGamer, jbinda
       * @since 1.0.0
       */
      const ctx = await contextHandler
        .parsePR({ client: this.client, repo: this.repo }, config, context)
        .catch(err => {
          throw new loggingData(
            '500',
            `Error thrown while parsing PR context: `,
            err
          )
        })
      if (!ctx) {
        throw new loggingData('500', 'Pull Request not found on context')
      }
      log(new loggingData('100', `PR context: ${JSON.stringify(ctx)}`))
      curContext = {
        type: 'pr',
        context: ctx
      }
    } else if (context.payload.issue) {
      /**
       * Issue Context
       * @author IvanFon, TGTGamer, jbinda
       * @since 1.0.0
       */
      const ctx = await contextHandler
        .parseIssue({ client: this.client, repo: this.repo }, config, context)
        .catch(err => {
          throw new loggingData(
            '500',
            `Error thrown while parsing issue context: `,
            err
          )
        })
      if (!ctx) {
        throw new loggingData('500', 'Issue not found on context')
      }
      log(new loggingData('100', `issue context: ${JSON.stringify(ctx)}`))

      curContext = {
        type: 'issue',
        context: ctx
      }
    } else {
      /**
       * No Context
       * @author TGTGamer
       * @since 1.1.0
       */
      throw new loggingData(
        '300',
        `There is no context to parse: ${JSON.stringify(context.payload)}`
      )
    }
    return curContext
  }

  /**
   * Syncronise labels to repository
   * @author IvanFon, TGTGamer, jbinda
   * @since 1.0.0
   */
  async syncLabels(config: Config) {
    config.labels = await Object.entries(
      config.labels ? config.labels : []
    ).reduce((acc: { [key: string]: Label }, cur) => {
      acc[cur[1].name.toLowerCase()] = cur[1]
      return acc
    }, {})

    await utils.labels
      .sync({
        client: this.client,
        repo: this.repo,
        config: config.labels,
        dryRun: this.dryRun
      })
      .catch((err: { message: string | Error }) => {
        log(
          new loggingData(
            '500',
            `Error thrown while handling syncLabels tasks: ${err.message}`
          )
        )
      })
  }

  /**
   * Apply labels to context
   * @author IvanFon, TGTGamer, jbinda
   * @since 1.0.0
   */
  async applyContext(
    curContext: CurContext,
    config: Config,
    labelIdToName: { [key: string]: string }
  ) {
    if (curContext.type === 'pr') {
      await applyPR({
        client: this.client,
        configs: config,
        config: config.pr,
        context: curContext.context,
        labelIdToName,
        repo: this.repo,
        dryRun: this.dryRun
      }).catch((err: { message: string | Error }) => {
        log(
          new loggingData(
            '500',
            `Error thrown while handling PRLabel tasks: ${err.message}`
          )
        )
      })
    } else if (curContext.type === 'issue') {
      await applyIssue({
        client: this.client,
        configs: config,
        config: config.issue,
        context: curContext.context,
        labelIdToName,
        repo: this.repo,
        dryRun: this.dryRun
      }).catch((err: { message: string | Error }) => {
        log(
          new loggingData(
            '500',
            `Error thrown while handling issueLabel tasks: ${err.message}`
          )
        )
      })
    }
  }
}
