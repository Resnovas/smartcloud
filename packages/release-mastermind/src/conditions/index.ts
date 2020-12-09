export { log } from '../'
export * from './issue'
export * from './pr'
export * from './project'
export * from './util'
import { Labels } from '../types'

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
  IDNumber: number
}

interface Props {
  creator: string
  description: string
  locked: boolean
  state: 'open' | 'closed'
  title: string
  labels?: Labels
}

export interface PRProps extends Props {
  pullRequestID: number
  branch: string
  isDraft: boolean
  files: string[]
  reviews: Reviews
  pendingReview: boolean
  requestedChanges: number
  approved: number
  changes: number
}
export interface IssueProps extends Props {}
export interface ProjectProps extends Props {
  project_id: number
  column_id: number
  changes: {
    column_id: {
      from: number
    }
  }
  cardID: number
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

export type Reviews = Review[]
export interface Review {
  id?: number
  node_id?: string
  user?: any
  body?: string
  state?: 'APPROVED' | '' | string
  html_url?: string
  pull_request_url?: string
  author_association?: string
  _links?: {}
  submitted_at?: string
  commit_id?: string
}
