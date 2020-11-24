import { ApiProps } from '.'
import { Labels } from '../types'

class labels {
  async get({ client, repo }: ApiProps): Promise<Labels> {
    const options = await client.issues.listLabelsForRepo.endpoint.merge({
      ...repo
    })
    const labels = await client.paginate(options)
    return labels.map(label => label.name)
  }
}
export const labelAPI = new labels()
