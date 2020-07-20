# Contributing

First off, thank you for considering contributing to this project.

This project uses the [Univeersal GitActions Workflows](https://github.com/TGTGamer/Universal-GitAction-Workflows) to automate our workflow, alongside provide templates for issues and pull requests. If you want to learn more about exactly what is included within the workflows, please checkout the documentation there.

## Why the guidelines

Following these guidelines helps to communicate that you respect the time of the developers managing and creating this project. In return, they should reciprocate that respect in addressing your issue, assessing changes, and helping you finalize your pull requests. We created these guideleines to ensure that everyone has the same information when working on the project.

* Please don't use the issue tracker for support questions.
* Please check whether the FAQ or can help with your issue.
* Please check the closed tickets & pull requests before opening an new one.

## Contributor License Agreement

We have a Contributor License Agreement which can be found at [`{root}/docs/getting-started/contributing/agreement.md`](./AGREEMENT.md). It is required for [Standard Contributions](contribution-types.md#std) and [Major Contributions](contribution-types.md#major).

## Responsibilities

* Ensure cross-platform compatibility for every change that's accepted. Windows, Mac, Debian & Ubuntu Linux.
* Ensure that code meets all [requirements](contribution-types.md)
* Create issues for any major changes and enhancements that you wish to make. Discuss things transparently and get community feedback.
* Ensure each contribution is created on its own branch to ensure we can follow [Semantic Versioning](http://semver.org/)
* Be welcoming to newcomers and encourage diverse new contributors from all backgrounds

## Your First Contribution

Unsure where to begin contributing? You can start by looking through these beginner and help-wanted issues:

* First Timers - issues specific for first time github users, designed and created to guide you through contributing.
* Beginner issues - issues which should only require a few lines of code, and a test or two.
* Help wanted - issues which should be a bit more involved than beginner issues.

## Your first project

Working on your first Pull Request? You can learn how from this _free_ series, [How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github)

At this point, you're ready to make your changes! Feel free to ask for help; everyone is a beginner at first!

If a maintainer asks you to "rebase" your PR, they're saying that a lot of code has changed, and that you need to update your branch so it's easier to merge. Note that we do provide an automatic command for this which can be attempted through commenting `/rebase`.

## Creating a merge request

When you believe you have completed your contribution, you will need to make an pull request. This should be simple for most users, and we have provided some templates for you to get started, however if you choose to create your pull request from scratch, please ensure the following steps are followed.

### Titling your request

We use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) format when creating pull requests, this is so we can squash all pull requests when merging and automatically create our changelog and releases. To ensure that this convention is completed, our automation will fail if the title does not follow this standard.

### Prefixes

If you are still working on your pull request, please ensure that you prefix it with `WIP:` to ensure that the pull isn't accidently merged before it's ready.

## Security Disclosures

 In order to determine whether you are dealing with a security issue, ask yourself these two questions:

* Can I access something that's not mine, or something I shouldn't have access to?
* Can I disable something for other people?

If the answer to either of those two questions are "yes", then you're probably dealing with a security issue. Note that even if you answer "no" to both questions, you may still be dealing with a security issue, so if you're unsure, just email us.

## Understanding Labels

* **Statuses**
  * `Abandoned` - This issue / pull request has been abandon
  * `Available` - This issue is available for either Developers or Community contributors to develop
  * `Blocked` - Another issue is blocking the development of this issue
  * `Completed` - Development has finished and been merged for this issue
  * `In Progress` - Development is underway for this issue
  * `On Hold` - The developers have decided to hold the development of this request
  * `Pending` - The developers have approved development of this request.
  * `Review Needed` - This pull request is waiting on review
  * `Revision Needed` - This pull request has been reviewed and requires revision
  * `Do not develop` - This wont be worked on by DevOPS or Community contributor
  * `Stale` - This issue has been automatically marked as stale because it has not had recent activite

* **Types**
  * `Chore` - Changes to the build process or auxiliary tools and libraries such as documentation generation
  * `Bug` - A possible bug
  * `Maintenance` - Changes to maintain the project
  * `Discussion` - A conversation about something
  * `Documentation` - Changes to the documentation
  * `Feature` - A new feature
  * `Enhancement` - Improving a feature
  * `Question` - Question about this project
  * `Fix` - A bug fix
  * `Optimisation` - A code change that improves performance
  * `Refactor` - A code change that neither fixes a bug nor adds a feature
  * `Revert` - Removes & Discards a previous change as error
  * `Decrecated` - Removes previous functionality which is no longer needed
  * `Removal` - Removes previous functionality which is no longer needed
  * `Style` - Changes that do not affect the meaning of the code (white-space formatting missing semi-colons etc)

* **DevOps**
  * `Accepted` - DevOPS are planning
  * `Completed` - DevOPS have complete
  * `Deploying` - DevOPS are deploying to latest
  * `Developing` - DevOPS are Developing
  * `Rejected` - DevOPS wont continue
  * `Reviewing` - DevOPS awaiting review
  * `Staging` - DevOPS deployed to Staging
  * `Testing` - DevOPS deployed to Testing

* **ComOps**
  * `Accepted` - A community contributor is planning to work on this issue
  * `Completed` - The contributor has completed this issue and handed over to the developers to stage & deploy
  * `Developing` - The contributor is developing this issue
  * `Awaiting Review` - The contributor is awaiting review
  * `Testing` - The contributor is awaiting testing results
  
* **Bugs**
  * `Low` - This bug isn't a high priority for the next release
  * `Medium` - This bug affects more than 10% of users and should be patched before the next major release
  * `High` - This bug affects more than 25% of users and should be patched before the next minor release
  * `Critical` - This bug affects more than 50% of users and should be patched before any new features are added
  * `Confirmed` - This bug has been confirmed
  * `New` - This bug is new
  * `Fixed` - This bug has been fixed

* **Content types**
  * `Dependences` - Changes that affect the dependences
  * `Workflow & CI` - Changes that affect the workflow & CI
  * `UI / UX` - Changes that affect the UI / UX
  * `Backend` - Changes that affect the backend
  * `Frontend` - Changes that affect the fronted

* **Miscellaneous**
  * `security fix` - A Security Fix
  * `security vulnerability` - A Security vulnerability
  * `Duplicate` - A Duplicate of another issue/pull
  * `Help wanted` - Help is needed to continue
  * `Needs rebase` - This request needs to be rebased
  * `Work in progress` - This pull request is a wip
  * `Sponsor Request ❤️` - This request has come from a sponsor
  * `More information needed` - Requires more information before it can continue
  * `First Timers` - A Good issue for first time github users
  * `skip-changelog` - Skip the changelog
  * `automerge` - Automatically Merge this request
  * `good first issue` - What it says on the tin. This helps new people find stuff to work on, because [GitHub actively promotes it](https://help.github.com/articles/helping-new-contributors-find-your-project-with-labels/) and [initializes new repositories with that label](https://help.github.com/articles/about-labels/#using-default-labels).

