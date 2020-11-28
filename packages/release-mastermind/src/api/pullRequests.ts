import { Event, IssueApiProps } from '.'
import { Reviews } from '../conditions'

export async function list({ client, IDNumber, repo }: IssueApiProps) {
  const files = await client.pulls.listFiles({
    ...repo,
    pull_number: IDNumber,
    per_page: 100
  })
  return files.data.map(file => file.filename)
}

export async function changes(Additions: number, deletions: number) {
  return Additions + deletions
}

export const reviews = {
  async create(
    { client, IDNumber, repo }: IssueApiProps,
    body?: string,
    event?: Event,
    comments?: any
  ) {
    const reviews = await client.pulls.createReview({
      ...repo,
      pull_number: IDNumber,
      body,
      event,
      comments
    })
    return reviews.data
  },
  async update(
    { client, IDNumber, repo }: IssueApiProps,
    review_id: number,
    body: string
  ) {
    const reviews = await client.pulls.updateReview({
      ...repo,
      pull_number: IDNumber,
      review_id,
      body
    })
    return reviews.data
  },
  async dismiss(
    { client, IDNumber, repo }: IssueApiProps,
    review_id: number,
    message: string
  ) {
    const reviews = await client.pulls.dismissReview({
      ...repo,
      pull_number: IDNumber,
      review_id,
      message
    })
    return reviews.data
  },

  async list({ client, IDNumber, repo }: IssueApiProps) {
    const reviews = await client.pulls.listReviews({
      ...repo,
      pull_number: IDNumber,
      per_page: 100
    })
    return reviews.data
  },

  async pending(reviews: number, requested_reviews: number) {
    return reviews < requested_reviews
  },

  async requestedChanges(reviews: Reviews) {
    let changes: number = 0
    reviews.forEach(review => {
      if (review.state == 'CHANGES_REQUESTED') changes++
    })
    return changes
  },

  async isApproved(reviews: Reviews) {
    let approved: number = 0
    reviews.forEach(review => {
      if (review.state == 'APPROVED') approved++
    })
    return approved
  }
}
