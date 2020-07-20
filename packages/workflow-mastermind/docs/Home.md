# Universal GitActions Workflows

Welcome to this template for GitActions Workflow.

<!-- toc -->
<!-- tocstop -->

## Introduction

When working on GitActions, I found that there went many templates of high quality to use, which made my life hell for quiet a while. In total I submitted in excess of 300 commits to get my initial workflow running how I wanted, and that just isn't acceptable. Within this repository, I am to provide the tools and solutions for most of the common use cases within the development community for GitActions. This includes automatically generating content, updating dependencies, managing the project and much more. While this template is highly useful, it is not intended, nor will ever, replace development workflows on your personal projects. We have ensured not to include any lint or build tools.

To make it super simple for everyone to use, we built every job using an environment variable importer. A big thanks to [@technote-space](https://github.com/technote-space) for creating [Load Config Action](https://github.com/technote-space/load-config-action) which basically powers this entire configuration.

*Note:* due to the way Github handles Actions, I chose to develop this project on both Branches & Forks, in the hopes of having a cleaner commit history which will make it easier for you to understand what is happening. If you want to help creating this template, feel free to checkout the Contribution Guidelines.  

## Github Actions

GitHub Actions makes it easy to automate all your software workflows, now with world-class CI/CD. Build, test, and deploy your code right from GitHub. Make code reviews, branch management, and issue triaging work the way you want. Kick off workflows with GitHub events like push, issue creation, or a new release. Combine and configure actions for the services you use, built and maintained by the community. Whether you want to build a container, deploy a web service, or automate welcoming new users to your open source projects—there's an action for that.

Read more about Github Actions [here](https://github.com/features/actions)

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

It is **Extremely** important to understand while using this template the code within `.github/workflows` & the templates within `.github/ISSUE_TEMPLATE` will automatically update within a new pull request whenever the template is updated. If you choose to change anything within these files, please ensure to review the automatic pull requests before merging them.

To get started with this template, please follow our [documentation](docs/getting-started/getting-started.md). If you like to contribute to this template, please read the [contributing guidelines](docs/contributing/README.md).

## Why use this template

This template is simply designed to save you, your team or community hours of painful debugging and stress creating a workflow from scratch. With many functions which users use regulary built in with simple `boolean` toggles setup within our `allconfig.yml`, this template is one of the quickest ways to get your custom workflow up and running without any serious hassle. Each action within this template has been hand picked and customised to work perfectly with each other, while also ensuring that everything is customisable.

This workflow does use a couple of External applications, they are not required but we highly recommend installing them. You can find more about the bots used within this workflow within the appriciations & configuations docs.  

<!-- Move to another page -->
### Understanding user workflow

1. User creates issue
   1. Automatically gets labeled based on title & body
   2. [Needs: a] Branch Automatically gets generated
   3. [Needs: a] Automatically gets assigned to project board
2. Branch is worked on by contributor
3. Contributor uses commands to move project in boards using [commands]() which trigger labels
4. Contributor creates pull request
   1. Automatically gets labeled based on if `WIP:` is prefixed
   2. Automatically gets labeled based on branch path
   3. Automatically gets labeled based on pull request size
   4. Automatically gets labeled based on changed file paths
   5. Automatically checks for conflicts with `Master` and `Pull Requests`
   6. Automatically ensures the `CLA` has been signed
5. Pull Request gets merged to master
   1. Automatically invites user to team `Community`
   2. Automatically creates & updates changelog.md
   3. Automatically creates & updates github release
   4. Automatically checks for updates to documentation (synced both directions)
      1. Copies & renames files
         - cp README.md -> docs/README.md (Used in gitbook)
         - cp README.md -> docs/Home.md (Used in {{repo}}.wiki)
         - cp docs/SUMMARY.md -> docs/_Sidebar.md (Used in {{repo}}.wiki)
         - cp CHANGELOG.md -> docs/information/changelog.md
      2. Automatically pushes to {{repo}}.wiki.git (Used in {{repo}}.wiki)
      3. Automatically pushes to {{repo}}_wiki.git (Used in gitbook)

### Understanding developer workflow

I will add this shortly, as soon as I get it all working xD.

## Final Note

Thank you for taking the time to look through this repository. If you have liked what you have found, please would you favourite & share. Ideally I would like to get a community behind this project which can ensure that it is maintained, updated and improved as GitActions get more siffisticated.
