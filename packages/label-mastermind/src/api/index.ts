import * as github from '@actions/github'
import * as files from './files'
import * as issues from './issues'
import * as labels from './labels'
import * as project from './project'
import * as pullRequests from './pullRequests'

export const api = {
  files,
  issues,
  labels,
  project,
  pullRequests
}
export interface Repo {
  owner: string
  repo: string
}
export interface ApiProps {
  client: github.GitHub
  repo: Repo
}
export interface IssueApiProps extends ApiProps {
  IDNumber: number
}
export type Event = 'REQUEST_CHANGES' | 'APPROVE' | 'COMMENT'
export type Tags = string[]
