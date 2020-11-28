import { ApiProps } from '.'
import { Tags } from '.'

export async function get({ client, repo }: ApiProps): Promise<Tags> {
  const options = await client.repos.listTags({
    ...repo
  })
  const tags = await client.paginate(options)
  return tags.map(tag => tag.name)
}
