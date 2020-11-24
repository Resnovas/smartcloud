import * as github from '@actions/github'
export * from './files'
export * from './labels'
export * from './pullRequests'

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
