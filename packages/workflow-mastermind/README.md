# TGTGamer/.github

**This is currently a work in progress. If you have somehow found this while im doing serious updates, drop me a line or open a issue and i will notify you when it's ready to be used**

This is a .github repository which I use across all my organisations & personal projects. Within this repository, you will find the configuration for many, many things. We choose to use workflows more than bots, however, some have been included to speed things up. If you have any questions or notice a bug, let us know in the issues and we will endeavour to fix them asap.

This project is completely free to use, without any requirements and without warranty.

**You MUST keep clean commit history (ideally squashing your changes, so each commit correspond to single change/feature) for some of these features to work correctly**

**To use this collection, you need to ensure that you have the following branches**
- `docs/auto-update` - Used for all automatic updates except changelog
- `chore/changelog` - Used for automatic changelog creation

## Workflows (Git Actions)

**`.github/workflows/issues.yml`**
- Ensure Labels - When `/labels` is commented will add all labels from `.github/labels.json`
- Assign to project - When new, assigns to project `1` (DevOps). When label `Type - Bug` assigns to project `2` (Issues)
- Create a branch - Creates branches from `development` and posts comment with the branch attached. Following rules apply:
    - All branches will be created with the name {issue.number}-{issue.title}
    - Labels are used to define branch types
    - `Type - Chore, Feature, Enhancement, Maintenance, Refactor, Style, Optimisation & Bug` will be created with the appropriate prefix
    - `Type: Discussion, Question, Revert` will automatically be skipped
    - Anything not already defined will be created with the prefix `issue/`
- Revert Commits - When `/revert {commit id}` is commented will automatically revert that commit
- CLA Assistant - When a Pull Request has the comment `/recheckcla` or the CLA acknowledge message, will run CLA checks to ensure contributor has signed the CLA.
- Always Run - This job is used to prevent the workflow to fail when all other jobs are skipped.


**`.github/workflows/projects.yml`**
- Automatically apply labels based on the configuration in `.github/card-labeler.yml`


**`.github/workflows/pullrequests.yml`**
- Assign to project - When new pull request, assign to project `1`(DevOps)
- Semantic Title - Ensures that the title of the pull request follows the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard.
- Labeller - Automatically labels pull requests with the matching `Type - {type}` label based on branch path. This matches the previously setup `Create a branch` found in the issues workflow
- Rebase - When `/rebase` automatically rebases the branch (Not fully tested)
- Conflict Check - Checks the current pull request against other open pull requests for conflicts
- Pull Request Size - Counts the number of lines changed and adds/removes labels
- CLA Assistant - Checks the contributor has signed the CLA before the commit is merged
- Work In Progress - Blocks merge if the title contains `WIP` (Works best when included within the branch protection rules with `Include Administrators`)


**`.github/workflows/push.yml`**
- Invite - Invites successful contributors to organisation team "community"
- Update Release Draft - Updates the release draft based on config in `.github/release-drafter.yml` (This is our basic changelog generator - New one coming soon)


**`.github/workflows/cron.yml`**
- Stale - Marks stale issues & Pull requests after 30 days, followed by closing them after another 5 days.


## Bots & External Applications

**`.github/dependabot.yml`**
- APP URL: https://dependabot.com/
- npm - Checks NPM packages for updates daily at 0200 UTC and labels pull requests according to config.
- gitactions - Checks gitactions packages for updates daily at 0200 UTC and labels pull requests according to config.


**`.github/config.yml`**
- APP URL: https://probot.github.io/apps/request-info/
- Checks pull requests and issues against templates to ensure that users have provided enough information
- APP URL: https://probot.github.io/apps/sentiment-bot/
- Replies to toxic comments with designated comment


**`.github/first-timers.yml`**
- APP URL: https://github.com/hoodiehq/first-timers-bot
- Create beautiful issues for first-time Open Source contributors – automagically ✨ based on hidden branches.


**`.all-contributorsrc`**
- APP URL: https://github.com/all-contributors/all-contributors-bot
- The @all-contributors bot automatically adds contributor acknowledgements according to the all-contributors specification


**`contributing.json`**
- APP URL: https://gitmagic.io/
- Defines your contribution guidelines for issues, pull requests, branches and commit messages.


**`pullapprove.yml`**
- APP URL: https://www.pullapprove.com/
- PullApprove gives you full control over your review process. Decide exactly who needs to review which PRs, and when. PullApprove will automatically request reviewers to make it happen.


**`.whitesource`**
- APP URL: https://bolt.whitesourcesoftware.com/github/
- Harness the power of open source without compromising on security or agility!


**No config files:**
- [GitGuardian](https://dashboard.gitguardian.com/) - GitGuardian provides real-time secrets detection and security policies enforcement across all your repositories.
