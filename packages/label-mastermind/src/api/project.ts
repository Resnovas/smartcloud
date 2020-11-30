import { ApiProps } from '.'

export const column = {
  async list({ client, repo }: ApiProps, project_id: number) {
    return (
      await client.projects.listColumns({
        ...repo,
        project_id
      })
    ).data
  },
  async get({ client, repo }: ApiProps, column_id: number) {
    return (
      await client.projects.getColumn({
        ...repo,
        column_id
      })
    ).data
  }
}
