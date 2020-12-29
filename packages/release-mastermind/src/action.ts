import * as core from '@actions/core'
import * as github from '@actions/github'
import { GitHub } from '@actions/github'
import { loggingData } from '@videndum/utilities'
import fs from 'fs'
import { log } from '.'
import { Config, Label, Options, Runners } from '../types'
import { CurContext } from './conditions'
import { contextHandler } from './contextHandler'
import { Issues, Project, PullRequests } from './contexts'
import { Utils } from './utils'

let local: any
let context = github.context

try {
  local = require('../config.json')
  process.env.GITHUB_REPOSITORY = local.GITHUB_REPOSITORY
  process.env.GITHUB_REPOSITORY_OWNER = local.GITHUB_REPOSITORY_OWNER
  if (!context.payload.issue && !context.payload.pull_request)
    context = require(local.github_context)
} catch {}

export default class releaseMastermind {
  client: GitHub
  opts: Options
  configJSON: Options['configJSON']
  configPath: Options['configPath']
  dryRun: Options['dryRun']
  repo = context.repo || {}
  util: Utils

  constructor(client: GitHub, options: Options) {
    log(
      new loggingData(
        '100',
        `Release Mastermind Constructed: ${options.toString()}`
      )
    )
    core.startGroup('Setup Phase')
    this.client = client
    this.opts = options
    this.configJSON = options.configJSON
    this.configPath = options.configPath
    this.util = new Utils({ client, repo: this.repo }, options.dryRun)
    this.dryRun = options.dryRun
  }

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
    log(new loggingData('100', `Config: ${JSON.stringify(this.configJSON)}`))

    const configs = await this.processConfig().catch(err => {
      throw log(
        new loggingData('500', `Error thrown while processing config: `, err)
      )
    })
    if (!configs.runners[0]) {
      throw log(new loggingData('500', `No config data.`))
    }

    if (configs.labels) {
      /**
       * Syncronise the labels
       * @author TGTGamer
       * @since 1.1.0
       */
      await this.syncLabels(configs).catch(err => {
        throw log(
          new loggingData(
            '100',
            `Error thrown while syncronising labels: `,
            err
          )
        )
      })
    }

    // Run each release manager
    configs.runners.forEach(async config => {
      /**
       * Convert label ID's to Names
       * @author TGTGamer
       * @since 1.1.0
       */
      config.labels = await Object.entries(
        configs.labels ? configs.labels : []
      ).reduce((acc: { [key: string]: string }, cur) => {
        acc[cur[0]] = cur[1].name
        return acc
      }, {})

      log(new loggingData('100', `Config: ${JSON.stringify(config)}`))

      /**
       * Get the context
       * @author TGTGamer
       * @since 1.1.0
       */
      const curContext = await this.processContext(config).catch(err => {
        throw log(
          new loggingData('500', `Error thrown while processing context: `, err)
        )
      })
      log(
        new loggingData('100', `Current Context: ${JSON.stringify(curContext)}`)
      )

      /**
       * Combine the Shared & Context.type Configs
       * @author TGTGamer
       * @since 1.1.0
       */

      for (const action in config.sharedConfig) {
        const ctx = config[curContext.type]
        if (!ctx) return
        if (action == 'labels') {
          for (const label in config.sharedConfig.labels) {
            if (ctx.labels && !(label in ctx)) {
              config[curContext.type]!.labels![label] =
                config.sharedConfig.labels[label]
            }
          }
        } else if (action == 'enforceConventions') {
          ctx[action] = config.sharedConfig[action]
        }
      }
      core.endGroup()
      this.applyContext(configs, config, curContext)
    })
  }

  /**
   * Get the configuration
   * @author IvanFon, TGTGamer, jbinda
   * @since 1.0.0
   */
  async processConfig(): Promise<Runners> {
    if (!this.configJSON?.runners[0]) {
      if (!fs.existsSync(this.configPath)) {
        throw new Error(`config not found at "${this.configPath}"`)
      }
      const pathConfig = await JSON.parse(
        fs.readFileSync(this.configPath).toString()
      )
      if (!pathConfig.releaseMastermind) return pathConfig
      else return pathConfig.releaseMastermind
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
        .parsePR(this.util, config, context)
        .catch(err => {
          throw log(
            new loggingData(
              '500',
              `Error thrown while parsing PR context: `,
              err
            )
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
        .parseIssue(this.util, config, context)
        .catch(err => {
          throw log(
            new loggingData(
              '500',
              `Error thrown while parsing issue context: ` + err
            )
          )
        })
      if (!ctx) {
        throw new Error('Issue not found on context')
      }
      log(new loggingData('100', `issue context: ${JSON.stringify(ctx)}`))

      curContext = {
        type: 'issue',
        context: ctx
      }
    } else if (context.payload.project_card) {
      /**
       * Project Context
       * @author TGTGamer
       * @since 1.0.0
       */
      const ctx = await contextHandler
        .parseProject(this.util, config, context)
        .catch(err => {
          log(
            new loggingData(
              '500',
              `Error thrown while parsing Project context: `,
              err
            )
          )
          return err
        })
      if (!ctx) {
        throw new Error('Issue not found on context')
      }
      log(new loggingData('100', `issue context: ${JSON.stringify(ctx)}`))

      curContext = {
        type: 'project',
        context: ctx
      }
    } else {
      /**
       * No Context
       * @author TGTGamer
       * @since 1.1.0
       */
      throw log(
        new loggingData(
          '300',
          `There is no context to parse: ${JSON.stringify(context.payload)}`
        )
      )
    }
    return curContext
  }

  /**
   * Syncronise labels to repository
   * @author IvanFon, TGTGamer, jbinda
   * @since 1.0.0
   */
  async syncLabels(config: Runners) {
    const labels = await Object.entries(
      config.labels ? config.labels : []
    ).reduce((acc: { [key: string]: Label }, cur) => {
      acc[cur[1].name.toLowerCase()] = cur[1]
      return acc
    }, {})

    await this.util.labels.sync(labels).catch(err => {
      log(
        new loggingData(
          '500',
          `Error thrown while handling syncLabels tasks:`,
          err
        )
      )
    })
  }

  applyContext(runners: Runners, config: Config, curContext: CurContext) {
    let ctx: PullRequests | Issues | Project
    if (curContext.type == 'pr') {
      ctx = new PullRequests(
        this.util,
        runners,
        config,
        curContext,
        this.dryRun
      )
      ctx.run()
    } else if (curContext.type == 'issue') {
      ctx = new Issues(this.util, runners, config, curContext, this.dryRun)
      ctx.run().catch(err => {
        throw log(
          new loggingData('500', `Error thrown while running context: `, err)
        )
      })
    } else if (curContext.type == 'project') {
      ctx = new Project(this.util, runners, config, curContext, this.dryRun)
      ctx.run().catch(err => {
        throw log(
          new loggingData('500', `Error thrown while running context: `, err)
        )
      })
    }
  }
}
