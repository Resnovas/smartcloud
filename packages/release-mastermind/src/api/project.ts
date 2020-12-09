import { ApiProps } from '.'

export const column = {
  async list({ client, repo }: ApiProps, project_id: number) {
    return (
      await client.projects.listColumns({
        project_id
      })
    ).data
  },
  async get({ client, repo }: ApiProps, column_id: number) {
    return (
      await client.projects.getColumn({
        column_id
      })
    ).data
  },
  async listCards({ client, repo }: ApiProps, column_id: number) {
    return (
      await client.projects.listCards({
        column_id
      })
    ).data
  }
}
export const card = {
  async get({ client, repo }: ApiProps, card_id: number) {
    return (
      await client.projects.getCard({
        card_id
      })
    ).data
  },
  async create(
    { client, repo }: ApiProps,
    content_id: number,
    column_id: number,
    content_type?: 'Issue' | 'PullRequest'
  ) {
    return (
      await client.projects.createCard({
        content_id,
        column_id,
        content_type
      })
    ).data
  },
  async move({ client, repo }: ApiProps, card_id: number, column_id: number) {
    return client.projects.moveCard({
      card_id,
      column_id,
      position: 'top'
    })
  }
}

export const projects = {
  async get({ client, repo }: ApiProps, project_id: number) {
    return (
      await client.projects.get({
        project_id
      })
    ).data
  },
  async org({ client, repo }: ApiProps, org: string) {
    return (
      await client.projects.listForOrg({
        org
      })
    ).data
  },
  async user({ client, repo }: ApiProps, username: string) {
    return (
      await client.projects.listForUser({
        username
      })
    ).data
  },
  async repo({ client, repo }: ApiProps, owner: string, repository: string) {
    return (
      await client.projects.listForRepo({
        owner,
        repo: repository
      })
    ).data
  }
}
