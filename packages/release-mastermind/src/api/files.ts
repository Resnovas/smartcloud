import * as github from '@actions/github'
import { ApiProps, IssueApiProps } from '.'

class files {
  async get(
    { client, repo }: ApiProps,
    file: string,
    ref?: string
  ): Promise<string> {
    /**
     * Checks to see if the settings file is valid
     */
    let gotdata: any = await client.repos.getContents({
      owner: repo.owner || github.context.repo.owner,
      repo: repo.repo || github.context.repo.repo,
      ref: ref || 'master',
      path: file
    })
    return Buffer.from(gotdata.data.content, gotdata.data.encoding).toString()
  }

  async list({ client, IDNumber, repo }: IssueApiProps) {
    const files = await client.pulls.listFiles({
      ...repo,
      pull_number: IDNumber,
      per_page: 100
    })
    return files.data.map(file => file.filename)
  }
}
export const filesAPI = new files()
