import * as github from '@actions/github'
import { GitHub } from '@actions/github'
import fs from 'fs'
import { log } from '.'
import { contextHandler } from './contextHandler'
import { Issues, PullRequests } from './contexts'
import { Config, CurContext, Options } from './types'

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

  constructor(client: GitHub, options: Options) {
    log(`Release Mastermind Constructed: ${options}`, 1)
    this.client = client
    this.opts = options
    this.configJSON = options.configJSON
    this.configPath = options.configPath
    this.dryRun = options.dryRun
  }

  async run() {
    if (this.dryRun) this.repo.repo = process.env.GITHUB_REPOSITORY || 'Unknown'
    if (this.dryRun)
      this.repo.owner = process.env.GITHUB_REPOSITORY_OWNER || 'Unknown'
    log(`Repo data: ${this.repo.owner}/${this.repo.repo}`, 1)

    /**
     * Capture and log context to debug for Local Running
     * @author TGTGamer
     * @since 1.0.0
     */
    log(
      `Context for local running. See readme.md for information on how to setup local running: ${JSON.stringify(
        context
      )}`,
      1
    )

    /**
     * Process the config
     * @author TGTGamer
     * @since 1.1.0
     */
    log(`Config: ${JSON.stringify(this.configJSON)}`, 1)
    const configs: Config[] = await this.processConfig().catch(err => {
      log(`Error thrown while processing config: ` + err, 5)
      throw err
    })
    if (!configs) {
      log(`No config data.`, 5)
      throw new Error(`No configuration data to use`)
    }
    configs.forEach(async config => {
      log(`Config: ${JSON.stringify(config)}`, 1)

      /**
       * Get the context
       * @author TGTGamer
       * @since 1.1.0
       */
      const curContext = await this.processContext(config).catch(err => {
        log(`Error thrown while processing context: ` + err, 5)
        throw err
      })
      log(`Current Context: ${JSON.stringify(curContext)}`, 1)

      this.applyContext(config, curContext)
    })
  }

  /**
   * Get the configuration
   * @author IvanFon, TGTGamer, jbinda
   * @since 1.0.0
   */
  async processConfig(): Promise<Config[]> {
    if (!this.configJSON?.[0]?.projectType) {
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
        .parsePR({ client: this.client, repo: this.repo }, config, context)
        .catch(err => {
          log(`Error thrown while parsing PR context: ` + err, 5)
          throw err
        })
      if (!ctx) {
        throw new Error('Pull Request not found on context')
      }
      log(`PR context: ${JSON.stringify(ctx)}`, 1)
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
          log(`Error thrown while parsing issue context: ` + err, 5)
          throw err
        })
      if (!ctx) {
        throw new Error('Issue not found on context')
      }
      log(`issue context: ${JSON.stringify(ctx)}`, 1)

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
      log(`There is no context to parse: ${JSON.stringify(context.payload)}`, 3)
      throw new Error('There is no context')
    }
    return curContext
  }

  applyContext(config: Config, curContext: CurContext) {
    let ctx: PullRequests | Issues
    if (curContext.type == 'pr') {
      ctx = new PullRequests(this.client, this.repo, config, curContext.context)
      ctx.run()
    } else if (curContext.type == 'issue') {
      ctx = new Issues(config, curContext.context)
    }
  }
}
