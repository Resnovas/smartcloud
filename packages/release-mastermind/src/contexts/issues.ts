import { Config, IssueContext } from '../types'

export class Issues {
  private configs: Config
  private context: IssueContext

  constructor(configs: Config, curContext: IssueContext) {
    this.configs = configs
    this.context = curContext
  }
}
