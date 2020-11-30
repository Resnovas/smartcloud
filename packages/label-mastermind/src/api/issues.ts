import { ApiProps, IssueApiProps } from '.'

export async function get({ client, IDNumber, repo }: IssueApiProps) {
  return (
    await client.issues.get({
      ...repo,
      issue_number: IDNumber
    })
  ).data
}

export const comments = {
  async list({ client, IDNumber, repo }: IssueApiProps) {
    return (
      await client.issues.listComments({
        ...repo,
        issue_number: IDNumber
      })
    ).data
  },
  async get({ client, repo }: ApiProps, comment_id: number) {
    return (
      await client.issues.getComment({
        ...repo,
        comment_id
      })
    ).data
  },
  async create({ client, IDNumber, repo }: IssueApiProps, body: string) {
    return (
      await client.issues.createComment({
        ...repo,
        issue_number: IDNumber,
        body
      })
    ).data
  },
  async update({ client, repo }: ApiProps, comment_id: number, body: string) {
    return (
      await client.issues.updateComment({
        ...repo,
        comment_id,
        body
      })
    ).data
  },
  async delete({ client, repo }: ApiProps, comment_id: number) {
    return (
      await client.issues.deleteComment({
        ...repo,
        comment_id
      })
    ).data
  }
}
