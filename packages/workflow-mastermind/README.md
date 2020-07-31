# Universal GitActions Workflows

Welcome to this template for GitActions Workflow.

## Introduction

Within this repository, I am to provide the tools and solutions for most of the common use cases within the development community for GitActions. This includes automatically generating content, updating dependencies, managing the project and much more. While this template is highly useful, it is not intended, nor will ever, replace development workflows on your personal projects. We have ensured not to include any lint or build tools.

## In this template

1. Completely customisable configs
2. Automatic changelog & release creation
3. Automatic project management
4. Automatic merging & approval
5. Automatic contribution license agreements
6. Automatic updates with automerge via [Dependabot](https://docs.github.com/en/github/managing-security-vulnerabilities/configuring-github-dependabot-security-updates)
7. Automatic document syncronisation (see [here]())
8. Automatic labeling based on title, path, branch and files
9. Automatic branch creation based on labels
10. Commands for contribution automation

## Getting Started

It is **Extremely** important to understand while using this template, most of the code within `.github/` will automatically update within a new pull request whenever the [template](https://github.com/Videndum/Universal-GitAction-Workflows) is updated. Do not remove `.github/workflow-version.txt` or `.github/workflow-template.json` as they protect your files. You can read more about this [here]().

To get started with this template, please follow our [documentation](docs/getting-started/getting-started.md). If you like to contribute to this template, please read the [contributing guidelines](docs/contributing/README.md).

## Commands

Comment commands are built into this workflow to increase productivity, and reduce stress for open-source contributors. It allows users to do automation tasks without needing to get the developers involved. Each command has permission requirements to ensure misuse is reduced.

| Command | Author Association Required | Description |
| --- | --- | --- |
| /first-timer | First_Timer or None | Introduces inexperienced github users to our project
| /createbranch | Everyone | Creates a branch for an open issue |
| /revert | Collaborator | Reverts a previous commit automatically |
| /rebase | Collaborator or PR Owner | Rebases a pull request automatically |
| /claim | Everyone | Claims an open issue |
| /start | PR Assignee | Updates the PR or issues card & labels to be `In Progress` |
| /test | PR Assignee | Updates the PR or issues card & labels to be `Testing` |
| /requestreview | PR Assignee | Runs automation which triggers review requests |
| /stage | PR Reviewer | Stages the pull request for the next release |
| /reject | Collaborator | Rejects an issue |
| /hold | Collaborator | Places a issue or PR on hold |


## Why use this template

### Who's using this template

- [Universal GitActions Workflows](https://github.com/Videndum/Universal-GitAction-Workflows)
- [Smartcloud Artificial Assistant](https://github.com/Videndum/smartcloud)
- [Videndum/.github](https://github.com/Videndum/.github)

### What are Github Actions

GitHub Actions makes it easy to automate all your software workflows, now with world-class CI/CD. Build, test, and deploy your code right from GitHub. Make code reviews, branch management, and issue triaging work the way you want. Kick off workflows with GitHub events like push, issue creation, or a new release. Combine and configure actions for the services you use, built and maintained by the community. Whether you want to build a container, deploy a web service, or automate welcoming new users to your open source projects—there's an action for that.

Read more about Github Actions [here](https://github.com/features/actions)

### Rationality

When working on GitActions, I found that there went many templates of high quality to use, which made my life hell for quiet a while. In total I submitted in excess of 300 commits to get my initial workflow running how I wanted, and that just isn't acceptable.This template is simply designed to save you, your team or community hours of painful debugging and stress creating a workflow from scratch. With many functions which users use regulary built in with simple `boolean` toggles setup within our `allconfig.yml`, this template is one of the quickest ways to get your custom workflow up and running without any serious hassle. Each action within this template has been hand picked and customised to work perfectly with each other, while also ensuring that everything is customisable.

This workflow does use a couple of External applications, they are not required but we highly recommend installing them. You can find more about the bots used within this workflow within the appriciations & configuations docs.  

<!-- Move to another page -->
### Understanding contributor workflow

1. User creates issue
   1. Automatically gets labeled based on title & body
   2. Branch Automatically gets generated
   3. Automatically gets assigned to project board
2. Branch is worked on by contributor
3. Contributor uses commands to move project in boards using [commands]() which trigger labels
4. Contributor creates pull request
   1. Automatically gets labeled based on branch path, pull request size, changed file paths and if `WIP:` is prefixed
   2. Automatically checks for conflicts with `Master` and `Pull Requests`
   3. Automatically ensures the `CLA` has been signed
5. Pull Request gets merged to master
   1. Automatically invites user to organisation & adds to [allcontributors](https://allcontributors.org/)
   2. Automatically updates changelog.md and github release
   3. Automatically checks for updates to documentation (synced both directions)
      1. Copies & renames files
         - cp README.md -> docs/Home.md (Used in Github Wiki & gitbook)
         - cp docs/SUMMARY.md -> docs/_Sidebar.md (Used in Github Wiki)
      2. Automatically pushes to Github Wiki &/or External Wiki (e.g. repo_wiki.git)

### Understanding developer workflow

I will add this shortly, as soon as I get it all working xD.

## Final Note

Thank you for taking the time to look through this repository. If you have liked what you have found, please would you favourite & share. Ideally I would like to get a community behind this project which can ensure that it is maintained, updated and improved as GitActions get more siffisticated.
