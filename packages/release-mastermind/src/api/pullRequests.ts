import { IssueApiProps } from '.'
import { event } from '.'

export const reviews = {
  async create(
    { client, IDNumber, repo }: IssueApiProps,
    body?: string,
    event?: event,
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
  async delete(
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
  }
}
