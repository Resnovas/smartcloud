# Universal GitActions Workflows

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FVidendum%2FUniversal-GitAction-Workflows.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FVidendum%2FUniversal-GitAction-Workflows?ref=badge_shield)

Welcome to this template for GitActions Workflow. A fully automatically generating workflow template for Github.

- [Universal GitActions Workflows](#universal-gitactions-workflows)
  - [Features](#features)
  - [Getting Started](#getting-started)
    - [Automatic setup (Clean repository)](#automatic-setup-clean-repository)
    - [Automatic setup via CLI](#automatic-setup-via-cli)
    - [Manual setup](#manual-setup)
  - [ChatOps Commands](#chatops-commands)
  - [Rationale](#rationale)
    - [Who's using this template](#whos-using-this-template)
    - [What are Github Actions](#what-are-github-actions)
    - [Understanding contributor workflow](#understanding-contributor-workflow)
    - [Understanding developer workflow](#understanding-developer-workflow)
  - [Backlog & Contributing](#backlog--contributing)
  - [Final Note](#final-note)
  - [License](#license)

## Features

1. Completely customisable configs
2. Automatic changelog & release creation
3. Automatic project management
4. Automatic merging & approval
5. Automatic contribution license agreements
6. Automatic updates with automerge via [Dependabot](https://docs.github.com/en/github/managing-security-vulnerabilities/configuring-github-dependabot-security-updates)
7. Automatic document syncronisation
8. Automatic labeling based on title, path, branch and files
9. Automatic branch creation based on labels
10. Commands for contribution automation

## Getting Started

> [!IMPORTANT]
> It is **Extremely** important to understand while using this template, most of the code within `.github/` will automatically update within a new pull request whenever the [template](https://github.com/Videndum/Universal-GitAction-Workflows) is updated.

### Automatic setup (Clean repository)

Setting up this template shouldn't take long, it would defeat the purpose. Simplest way to get started is to click that `Use this template` button! Our template will automatically be built by Github, which will trigger our workflows which cleanup and setup everything for you.

[Use this template!](https://github.com/Videndum/Universal-GitAction-Workflows/generate)

### Automatic setup via CLI

[coming soon]

### Manual setup

To manually get started with this template, please follow our [documentation](docs/getting-started/getting-started.md).

## ChatOps Commands

Comment commands are built into this workflow to increase productivity, and reduce stress for open-source contributors. It allows users to do automation tasks without needing to get the developers involved. Each command has permission requirements to ensure misuse is reduced.

| Command        | Author Association Required | Description                                                |
| -------------- | --------------------------- | ---------------------------------------------------------- |
| /first-timer   | First_Timer or None         | Introduces inexperienced github users to our project       |
| /createbranch  | Everyone                    | Creates a branch for an open issue                         |
| /revert        | Collaborator                | Reverts a previous commit automatically                    |
| /rebase        | Collaborator or PR Owner    | Rebases a pull request automatically                       |
| /claim         | Everyone                    | Claims an open issue                                       |
| /start         | PR Assignee                 | Updates the PR or issues card & labels to be `In Progress` |
| /test          | PR Assignee                 | Updates the PR or issues card & labels to be `Testing`     |
| /requestreview | PR Assignee                 | Runs automation which triggers review requests             |
| /stage         | PR Reviewer                 | Stages the pull request for the next release               |
| /reject        | Collaborator                | Rejects an issue                                           |
| /hold          | Collaborator                | Places a issue or PR on hold                               |

## Rationale

### Who's using this template

- [Universal GitActions Workflows](https://github.com/Videndum/Universal-GitAction-Workflows)
- [Smartcloud Artificial Assistant](https://github.com/Videndum/smartcloud)
- [Videndum/.github](https://github.com/Videndum/.github)

### What are Github Actions

GitHub Actions makes it easy to automate all your software workflows, now with world-class CI/CD. Build, test, and deploy your code right from GitHub. Make code reviews, branch management, and issue triaging work the way you want. Kick off workflows with GitHub events like push, issue creation, or a new release. Combine and configure actions for the services you use, built and maintained by the community. Whether you want to build a container, deploy a web service, or automate welcoming new users to your open source projects—there's an action for that.

Read more about Github Actions [here](https://github.com/features/actions)

When working on GitActions, I found that there went many templates of high quality to use, which made my life hell for quiet a while. In total I submitted in excess of 300 commits to get my initial workflow running how I wanted, and that just isn't acceptable.This template is simply designed to save you, your team or community hours of painful debugging and stress creating a workflow from scratch. With many functions which users use regulary built in with simple `boolean` toggles setup within our `allconfig.yml`, this template is one of the quickest ways to get your custom workflow up and running without any serious hassle. Each action within this template has been hand picked and customised to work perfectly with each other, while also ensuring that everything is customisable.

This workflow does use a couple of External applications, they are not required but we highly recommend installing them. You can find more about the bots used within this workflow within the appriciations & configuations docs.

<!-- Move to another page -->

### Understanding contributor workflow

1. User creates issue
   1. Automatically gets labeled based on title & body
   2. Branch Automatically gets generated
   3. Automatically gets assigned to project board
2. Branch is worked on by contributor
3. Contributor uses commands to move project in boards using [commands](#chatops-commands) which trigger labels
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
         - cp docs/SUMMARY.md -> docs/\_Sidebar.md (Used in Github Wiki)
      2. Automatically pushes to Github Wiki &/or External Wiki (e.g. repo_wiki.git)

### Understanding developer workflow

I will add this shortly, as soon as I get it all working xD.

## Backlog & Contributing

Thank you for taking an interst in contributing. We have created development containers (`.devcontainer`) to allow you to jump straight in with coding. We even went through the hassle of setting up step by step guides using [CodeTour](https://github.com/vsls-contrib/codetour). Everything is configured and ready to go, all you need to do is use one of the supported platforms: [VSCode](https://code.visualstudio.com/docs/remote/remote-overview) | [Github Codespaces](https://github.com/features/codespaces)

For more information on how to contribute, please read the [contributing guidelines](docs/contributing/README.md).

Our backlog can be found on [Github](https://github.com/Videndum/Universal-GitAction-Workflows/projects/1)

## Final Note

Thank you for taking the time to look through this repository. If you have liked what you have found, please would you favourite & share. Ideally I would like to get a community behind this project which can ensure that it is maintained, updated and improved as GitActions get more suffisticated.

## License

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FVidendum%2FUniversal-GitAction-Workflows.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FVidendum%2FUniversal-GitAction-Workflows?ref=badge_large)
