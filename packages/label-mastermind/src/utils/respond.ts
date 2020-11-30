import { api, ApiProps } from '../api'
import { CurContext } from '../conditions'

export default function respond(
  CurContext: CurContext,
  { client, repo }: ApiProps,
  success: boolean,
  previousComment?: number,
  body?: string
) {
  if (!previousComment && !success) {
    if (CurContext.type == 'pr')
      api.pullRequests.reviews.create(
        { client, IDNumber: CurContext.context.IDNumber, repo },
        body,
        'REQUEST_CHANGES'
      )
    else
      api.issues.comments.create(
        { client, IDNumber: CurContext.context.IDNumber, repo },
        body as string
      )
  } else if (previousComment && !success) {
    if (CurContext.type == 'pr')
      api.pullRequests.reviews.update(
        { client, IDNumber: CurContext.context.IDNumber, repo },
        previousComment,
        body as string
      )
    else
      api.issues.comments.update(
        { client, repo },
        previousComment,
        body as string
      )
  } else if (previousComment && success) {
    if (CurContext.type == 'pr')
      api.pullRequests.reviews.dismiss(
        { client, IDNumber: CurContext.context.IDNumber, repo },
        previousComment,
        'Conventions corrected - Review no longer required'
      )
    else api.issues.comments.delete({ client, repo }, previousComment)
  } else if (!success) {
    if (CurContext.type == 'pr')
      api.pullRequests.reviews.create(
        { client, IDNumber: CurContext.context.IDNumber, repo },
        body,
        'REQUEST_CHANGES'
      )
    else
      api.issues.comments.create(
        { client, IDNumber: CurContext.context.IDNumber, repo },
        body as string
      )
  }
}
