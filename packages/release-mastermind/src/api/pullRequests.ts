import { IssueApiProps } from '.'
import { event } from '../types'

class PullRequests {
  async changes(Additions: number, deletions: number) {
    return Additions + deletions
  }

  async createReview(
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
  }

  async listReviews({ client, IDNumber, repo }: IssueApiProps) {
    const reviews = await client.pulls.listReviews({
      ...repo,
      pull_number: IDNumber,
      per_page: 100
    })
    return reviews.data
  }

  async pendingReview(reviews: number, requested_reviews: number) {
    return reviews < requested_reviews
  }
}

export const pullRequestsAPI = new PullRequests()
