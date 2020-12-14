import { ApiProps, IssueApiProps } from '.'
import { Label, Labels } from '../../types'
import { utils } from '../utils'

export async function add({
  client,
  repo,
  IDNumber,
  label,
  dryRun
}: IssueApiProps & {
  label: string
  dryRun: boolean
}) {
  if (!dryRun)
    await client.issues.addLabels({
      ...repo,
      issue_number: IDNumber,
      labels: [label]
    })
}

export async function create({
  client,
  repo,
  label,
  dryRun
}: ApiProps & { label: Label; dryRun: boolean }) {
  const color = utils.parsingData.formatColor(label.color)
  if (!dryRun) await client.issues.createLabel({ ...repo, ...label, color })
}

export async function del({
  client,
  repo,
  name,
  dryRun
}: ApiProps & { name: string; dryRun: boolean }) {
  if (!dryRun)
    await client.issues.deleteLabel({
      ...repo,
      name
    })
}

export async function get({ client, repo }: ApiProps): Promise<Labels> {
  const options = await client.issues.listLabelsForRepo.endpoint.merge({
    ...repo
  })
  const labels = await client.paginate(options)
  const labelsMap = labels.map(label => ({
    name: label.name,
    description: label.description,
    color: label.color
  }))

  return labelsMap.reduce((acc: { [key: string]: Label }, cur) => {
    acc[cur.name.toLowerCase()] = cur
    return acc
  }, {})
}

export async function remove({
  client,
  repo,
  IDNumber,
  label,
  dryRun
}: IssueApiProps & {
  label: string
  dryRun: boolean
}) {
  if (!dryRun)
    await client.issues.removeLabel({
      ...repo,
      issue_number: IDNumber,
      name: label
    })
}

export async function update({
  client,
  repo,
  label,
  dryRun
}: ApiProps & { label: Label; dryRun: boolean }) {
  const color = utils.parsingData.formatColor(label.color)
  if (!dryRun)
    await client.issues.updateLabel({
      ...repo,
      current_name: label.name,
      description: label.description,
      color
    })
}
