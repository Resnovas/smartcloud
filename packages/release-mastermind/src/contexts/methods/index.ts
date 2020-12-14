import { GitHub } from '@actions/github'
import { loggingData } from '@videndum/utilities'
import { Issues, PullRequests } from '..'
import {
  Config,
  IssueConfig,
  ProjectConfig,
  PullRequestConfig,
  Runners
} from '../../../types'
import {
  CurContext,
  IssueContext,
  PRContext,
  ProjectContext,
  Version
} from '../../conditions'
import { Project } from '../projects'
import { applyLabels } from './applyLabels'
import { assignProject } from './assignProject'
import * as conventions from './conventions'
import { syncRemoteProject } from './syncRemoteProject'
export { log } from '../..'

export class Contexts {
  protected runners: Runners
  protected configs: Config
  protected config: PullRequestConfig | IssueConfig | ProjectConfig
  protected curContext: CurContext
  protected context: ProjectContext | IssueContext | PRContext
  protected newVersion: Version = {}
  client: GitHub
  repo: { owner: string; repo: string }
  dryRun: boolean
  constructor(
    client: GitHub,
    repo: { owner: string; repo: string },
    runners: Runners,
    configs: Config,
    curContext: CurContext,
    dryRun: boolean
  ) {
    if (!client) throw new Error('Cannot construct without client')
    this.client = client
    if (!repo) throw new Error('Cannot construct without repo')
    this.repo = repo
    if (!runners) throw new Error('Cannot construct without configs')
    this.runners = runners
    if (!configs)
      throw new loggingData('500', 'Cannot construct without configs')
    this.configs = configs
    if (!curContext)
      throw new loggingData('500', 'Cannot construct without context')
    this.curContext = curContext
    const config = configs[curContext.type]
    if (!config)
      throw new loggingData('500', 'Cannot construct without configs')
    this.config = config
    this.newVersion = curContext.context.currentVersion
    this.context = curContext.context
    this.dryRun = dryRun
  }

  syncRemoteProject = (that: Project) => syncRemoteProject.call(that)
  assignProject = (that: Issues | PullRequests) => assignProject.call(that)
  applyLabels = () => applyLabels.call(this)

  conventions = {
    enforce: () => conventions.enforce.call(this)
  }
}
