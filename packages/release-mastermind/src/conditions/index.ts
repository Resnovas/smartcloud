export { log } from '../'
import { Labels } from '../types'
export * from './issue'
export * from './pr'
export * from './project'
export * from './util'
export * from './evaluator'

export type CurContext =
    | { type: 'pr'; context: PRContext }
    | { type: 'issue'; context: IssueContext }
    | { type: 'project'; context: ProjectContext }


export interface PRContext extends GeneralContext {
    prProps: PRProps
}
    
export interface IssueContext extends GeneralContext {
    issueProps: IssueProps
}
    
export interface ProjectContext extends GeneralContext {
    projectProps: ProjectProps
}
interface GeneralContext {
    ref?: string
    sha: string
    action: string
    currentVersion: Version
    labels: Labels
    IDNumber: number
}

interface Props {
    creator: string
    description: string
    state: 'open' | 'closed'
    title: string
  }

export interface PRProps extends Props {
    branch: string
}
export interface IssueProps extends Props {}
export interface ProjectProps extends Props {
  project_id: number
  column_id: number
}

export interface Version {
    name?: string
    semantic?: {
      major: number
      minor: number
      patch: number
      prerelease?: string
      build?: number
    }
  }