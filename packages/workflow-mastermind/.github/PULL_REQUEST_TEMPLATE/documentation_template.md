---
name: Documentation Location
about: Change the location of our documentation
title: 'docs: '
labels: 'Type - Documentation'
assignees: ''

---

<!-- Use this description template for changing documentation location. For new docs or updates to existing docs, use the "Documentation" template -->

## What does this MR do?

<!-- Briefly describe what this MR is about -->

## Related issues

<!-- Mention the issue(s) this MR closes or is related to -->

Closes

## Moving docs to a new location?

- [ ] Make sure the old link is not removed and has its updated to include a link to the new location on the first line (see hidden issue comment for example).
- [ ] Make sure internal links pointing to the document in question are not broken.
- [ ] Search and replace any links referring to old docs in GitLab Rails app,
      specifically under the `app/views/` and `ee/app/views` (for GitLab EE)  directories.
- [ ] Make sure to add [`redirect_from`](https://docs.gitlab.com/ce/development/documentation/index.html#redirections-for-pages-with-disqus-comments)
      to the new document if there are any Disqus comments on the old document thread.
- [ ] Ping one of the technical writers for review.

/label ~documentation
