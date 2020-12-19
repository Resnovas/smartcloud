# Mastermind Collection

The super-powered labeler for Github Actions, with complex customisable conditions for PR, Issues and Projects.

## Index

<!-- toc -->

- [Features](#features)
- [How to get support 👨‍👩‍👧‍👦](#how-to-get-support-%F0%9F%91%A8%E2%80%8D%F0%9F%91%A9%E2%80%8D%F0%9F%91%A7%E2%80%8D%F0%9F%91%A6)
  * [Why not GitHub Issues?](#why-not-github-issues)
- [Backlog & Contributing](#backlog--contributing)
- [Running Locally & Developing](#running-locally--developing)
  * [Prerequisities](#prerequisities)
  * [Developing](#developing)
  * [Running locally](#running-locally)
- [Getting Started](#getting-started)
  * [Automatic setup via CLI](#automatic-setup-via-cli)
  * [Manual setup](#manual-setup)
  * [All configuration options](#all-configuration-options)
    + [Runners](#runners)
    + [PullRequestConfig](#pullrequestconfig)
      - [EnforceConventions](#enforceconventions)
      - [AssignProject](#assignproject)
      - [SharedConventionsConfig](#sharedconventionsconfig)
      - [AutomaticApprove](#automaticapprove)
      - [Release](#release)
      - [ReleaseLabels](#releaselabels)
      - [CreateRelease](#createrelease)
      - [Changelog](#changelog)
        * [Sections](#sections)
      - [CreateMilestone](#createmilestone)
      - [DuplicateHotfix](#duplicatehotfix)
      - [SyncRemote](#syncremote)
    + [IssueConfig](#issueconfig)
      - [CreateBranch](#createbranch)
    + [ProjectConfig](#projectconfig)
      - [ExProjects](#exprojects)
      - [ProjectCreateBranch](#projectcreatebranch)
      - [Milestones](#milestones)
    + [Typings](#typings)
  * [Using Regex Patterns](#using-regex-patterns)
- [Available Conditions](#available-conditions)
  * [Common Conditions](#common-conditions)
    + [$and](#and)
    + [creatorMatches](#creatormatches)
    + [descriptionMatches](#descriptionmatches)
    + [hasLabel](#haslabel)
    + [isLocked](#islocked)
    + [isOpen](#isopen)
    + [$only](#only)
    + [$or](#or)
  * [Pull Request Conditions](#pull-request-conditions)
    + [branchMatches](#branchmatches)
    + [changesSize](#changessize)
    + [filesMatch](#filesmatch)
    + [isApproved](#isapproved)
    + [isDraft](#isdraft)
    + [pendingReview](#pendingreview)
    + [requestedChanges](#requestedchanges)
  * [Issue Conditions](#issue-conditions)
  * [Project Conditions](#project-conditions)
    + [onColumn](#oncolumn)
- [Final Note](#final-note)

<!-- tocstop -->

## Features
Label Mastermind is capable of the following:

- Create, Update, Delete Labels declaratively from Config file or JSON String
- Apply Labels based on conditions:
  - Pull Releases
  - Issues
  - Project Cards

Label Mastermind is designed to work in combination with other Videndum Studios Projects. Check out our [Universal Workflows Project](https://github.com/Videndum/Universal-GitAction-Workflows)

## How to get support 👨‍👩‍👧‍👦

For **Features Requests**, **Q&A**, **Show & Tell** and **Discussions** please use **[our discussions page](https://github.com/Videndum/action-masterminds/discussions)** 🚑.

We have a **FAQ** category in our **[discussions page](https://github.com/Videndum/action-masterminds/discussions)** where you can get quick answers, help with debugging weird issues, and general help.

Our extensive **documentation** can be found at **[here](https://github.com/Videndum/action-masterminds/blob/develop/README.md)**.

### Why not GitHub Issues?

GitHub is our office, it's the place where our development and contributor teams do their work. We use the issue list to keep track of bugs and the features that we are working on. We do this openly for transparency, to reduce replication by contributors and increase productivity.

With the discussion page, you can leverage the knowledge of our wider community to get help with any problems you are having. Please keep in mind that this project is open-source, support is provided by the goodwill of our wonderful community members.

## Backlog & Contributing

Thank you for taking an interst in contributing. We have created development containers (`.devcontainer`) to allow you to jump straight in with coding. We even went through the hassle of setting up step by step guides using [CodeTour](https://github.com/vsls-contrib/codetour). Everything is configured and ready to go, all you need to do is use one of the supported platforms: [VSCode](https://code.visualstudio.com/docs/remote/remote-overview) | [Github Codespaces](https://github.com/features/codespaces)

For more information on how to contribute, please read the [contributing guidelines](docs/contributing/README.md).

Our backlog can be found on [Github](https://github.com/Videndum/action-masterminds/projects/1)

## Running Locally & Developing

Setting up local running is simple, however we **MUST** warn that building / packaging while using local scripts can cause your GITHUB_TOKEN to be included within the package. To avoid this happening. you **MUST** follow the steps correctly. We will not be held responsible for any leeked personal tokens.

### Prerequisities

1. Setup a secret on your repository named: `ACTIONS_STEP_DEBUG` value: `true`
2. Ensure the action has run once after you created this secret

### Developing

3. Fork & Clone the [development repository](https://github.com/Videndum/action-masterminds)
4. Continue from step 4 of `Running Locally` then return to step 5 & 6.
5. Make changes, then rebuild using `npm run dev:run` or `yarn dev:run`
6. If uploading changes to Github
   - Delete `./context.json`, `./config`, `./lib`, `./dist`.
   - Run `yarn dev:all`.
   - Commit & push.

### Running locally

3. Fork & Clone this repository
4. Run `yarn install` or `npm install`
5. From the action logs find `Context for local running` copy the output into a file named `./context.json` at the root of the project.
6. Modify the `./config.sample.json` to contain your `GITHUB_TOKEN` and rename to `./config.json`
7. Run the script using `yarn dev:run` or `npm run dev:run`

## Getting Started

> [!IMPORTANT]
> It is **Extremely** important to understand while using this template, most of the code within `.github/` will automatically update within a new pull request whenever the [template repository](https://github.com/Videndum/Universal-GitAction-Workflows) is updated.

### Automatic setup via CLI

[coming soon]

### Manual setup

Create a new Github Actions workflow at `.github/workflows/main.yml`:

_Note: `actions/checkout` must be run first so that the release action can find your config file._

<details>
    <summary><b>main.yml</b></summary>

```yaml
on:
  issues:
    types: [opened, edited, closed, reopened]
  pull_request:
    types: [opened, edited, closed, reopened, synchronize]
  project_card:
    types: [created, moved, deleted]

jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: ./
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

</details>

Now create the config file at `.github/config.json`:

<details>
    <summary><b>Our config.json (very long)</b></summary>

```json
{
  "labels": {
    "abandoned": {
      "name": "Status - Abandoned",
      "color": "CFD3D7",
      "description": "This issue / pull request has been abandon"
    },
    "available": {
      "name": "Status - Available",
      "color": "CFD3D7",
      "description": "This issue is available for either Developers or Community contributors to develop"
    },
    "blocked": {
      "name": "Status - Blocked",
      "color": "CFD3D7",
      "description": "Another issue is blocking the development of this issue"
    },
    "completed": {
      "name": "Status - Completed",
      "color": "CFD3D7",
      "description": "Development has finished and been merged for this issue"
    },
    "progress": {
      "name": "Status - In Progress",
      "color": "CFD3D7",
      "description": "Development is underway for this issue"
    },
    "hold": {
      "name": "Status - On Hold",
      "color": "CFD3D7",
      "description": "The developers have decided to hold the development of this request"
    },
    "pending": {
      "name": "Status - Pending",
      "color": "CFD3D7",
      "description": "The developers have approved development of this request."
    },
    "review": {
      "name": "Status - Review Needed",
      "color": "CFD3D7",
      "description": "This pull request is waiting on review"
    },
    "revision": {
      "name": "Status - Revision Needed",
      "color": "CFD3D7",
      "description": "This pull request has been reviewed and requires revision"
    },
    "doNotDevelop": {
      "name": "Status - Do not develop",
      "color": "CFD3D7",
      "description": "This wont be worked on by DevOPS or Community contributor"
    },
    "stale": {
      "name": "Status - Stale",
      "color": "CFD3D7",
      "description": "This issue has been automatically marked as stale because it has not had recent activite"
    },
    "chore": {
      "name": "Type - Chore",
      "color": "0075CA",
      "description": "Changes to the build process or auxiliary tools and libraries such as documentation generation"
    },
    "bug": {
      "name": "Type - Bug",
      "color": "0075CA",
      "description": "A possible bug"
    },
    "maintenance": {
      "name": "Type - Maintenance",
      "color": "0075CA",
      "description": "Changes to maintain the project"
    },
    "discussion": {
      "name": "Type - Discussion",
      "color": "0075CA",
      "description": "A conversation about something"
    },
    "documentation": {
      "name": "Type - Documentation",
      "color": "0075CA",
      "description": "Changes to the documentation"
    },
    "feature": {
      "name": "Type - Feature",
      "color": "0075CA",
      "description": "A new feature"
    },
    "enhancement": {
      "name": "Type - Enhancement",
      "color": "0075CA",
      "description": "Improving a feature"
    },
    "fix": {
      "name": "Type - Fix",
      "color": "0075CA",
      "description": "A bug fix"
    },
    "optimisation": {
      "name": "Type - Optimisation",
      "color": "0075CA",
      "description": "A code change that improves performance"
    },
    "refactor": {
      "name": "Type - Refactor",
      "color": "0075CA",
      "description": "A code change that neither fixes a bug nor adds a feature"
    },
    "revert": {
      "name": "Type - Revert",
      "color": "0075CA",
      "description": "Removes & Discards a previous change as error"
    },
    "deprecated": {
      "name": "Type - Deprecated",
      "color": "0075CA",
      "description": "Marks functionality which is no longer needed"
    },
    "removal": {
      "name": "Type - Removal",
      "color": "0075CA",
      "description": "Removes previous functionality which is no longer needed"
    },
    "style": {
      "name": "Type - Style",
      "color": "0075CA",
      "description": "Changes that do not affect the meaning of the code (white-space formatting missing semi-colons etc)"
    },
    "dependences": {
      "name": "Type - Dependences",
      "color": "0075CA",
      "description": "Changes that affect the dependences"
    },
    "workflow": {
      "name": "Context - workflows",
      "color": "f9cea2",
      "description": "Related to ./.github/workflows"
    },
    "releaseMastermind": {
      "name": "Context - Release Mastermind",
      "color": "f9cea2",
      "description": "Related to @videndum/release-mastermind"
    },
    "labelMastermind": {
      "name": "Context - Label Mastermind",
      "color": "f9cea2",
      "description": "Related to @videndum/label-mastermind"
    },
    "variableMastermind": {
      "name": "Context - Variable Mastermind",
      "color": "f9cea2",
      "description": "Related to @videndum/variable-mastermind"
    },
    "installer": {
      "name": "Context - Installer",
      "color": "f9cea2",
      "description": "Related to @videndum/action-masterminds installer"
    },
    "devOpsAccepted": {
      "name": "DevOps - Accepted",
      "color": "172875",
      "description": "DevOPS are planning"
    },
    "devOpsCompleted": {
      "name": "DevOps - Completed",
      "color": "172875",
      "description": "DevOPS have complete"
    },
    "devOpsDeploying": {
      "name": "DevOps - Deploying",
      "color": "172875",
      "description": "DevOPS are deploying to latest"
    },
    "devOpsDeveloping": {
      "name": "DevOps - Developing",
      "color": "172875",
      "description": "DevOPS are Developing"
    },
    "devOpsRejected": {
      "name": "DevOps - Rejected",
      "color": "172875",
      "description": "DevOPS wont continue"
    },
    "devOpsReviewing": {
      "name": "DevOps - Reviewing",
      "color": "172875",
      "description": "DevOPS awaiting review"
    },
    "devOpsStaging": {
      "name": "DevOps - Staging",
      "color": "172875",
      "description": "DevOPS deployed to Staging"
    },
    "devOpsTesting": {
      "name": "DevOps - Testing",
      "color": "172875",
      "description": "DevOPS deployed to Testing"
    },
    "comOpsAccepted": {
      "name": "ComOps - Accepted",
      "color": "bfdadc",
      "description": "A community contributor is planning to work on this issue"
    },
    "comOpsCompleted": {
      "name": "ComOps - Completed",
      "color": "bfdadc",
      "description": "The contributor has completed this issue and handed over to the developers to stage & deploy"
    },
    "comOpsDeveloping": {
      "name": "ComOps - Developing",
      "color": "bfdadc",
      "description": "The contributor is developing this issue"
    },
    "comOpsAwaiting Review": {
      "name": "ComOps - Awaiting Review",
      "color": "bfdadc",
      "description": "The contributor is awaiting review"
    },
    "comOpsTesting": {
      "name": "ComOps - Testing",
      "color": "bfdadc",
      "description": "The contributor is awaiting testing results"
    },
    "android": {
      "name": "Platform - Android",
      "color": "E0BE84"
    },
    "aws": {
      "name": "Platform - AWS",
      "color": "E0BE84"
    },
    "google": {
      "name": "Platform - Google Cloud",
      "color": "E0BE84"
    },
    "ios": {
      "name": "Platform - IOS",
      "color": "E0BE84"
    },
    "ubuntu": {
      "name": "Platform - Ubuntu",
      "color": "E0BE84"
    },
    "fedora": {
      "name": "Platform - Fedora",
      "color": "E0BE84"
    },
    "debian": {
      "name": "Platform - Debian",
      "color": "E0BE84"
    },
    "macos": {
      "name": "Platform - MacOS",
      "color": "E0BE84"
    },
    "windows": {
      "name": "Platform - Windows",
      "color": "E0BE84"
    },
    "platformOther": {
      "name": "Platform - Other",
      "color": "E0BE84"
    },
    "priorityLow": {
      "name": "Priority - Low",
      "color": "8de8b3",
      "description": "This bug isn't a high priority for the next release"
    },
    "priorityMedium": {
      "name": "Priority - Medium",
      "color": "8de8b3",
      "description": "This bug affects more than 10% of users and should be patched before the next major release"
    },
    "priorityHigh": {
      "name": "Priority - High",
      "color": "8de8b3",
      "description": "This bug affects more than 25% of users and should be patched before the next minor release"
    },
    "priorityCritical": {
      "name": "Priority - Critical",
      "color": "8de8b3",
      "description": "This bug affects more than 50% of users and should be patched before any new features are added"
    },
    "xs": {
      "name": "Size - XS",
      "color": "d4c5f9",
      "description": "Less than 10 lines changed"
    },
    "s": {
      "name": "Size - S",
      "color": "d4c5f9",
      "description": "More than 10 lines changed"
    },
    "m": {
      "name": "Size - M",
      "color": "d4c5f9",
      "description": "More than 30 lines changed"
    },
    "l": {
      "name": "Size - L",
      "color": "d4c5f9",
      "description": "More than 100 lines changed"
    },
    "xl": {
      "name": "Size - XL",
      "color": "d4c5f9",
      "description": "More than 500 lines changed"
    },
    "xxl": {
      "name": "Size - XXL",
      "color": "d4c5f9",
      "description": "More than 1000 lines changed"
    },
    "fixConfirmed": {
      "name": "Fix - Confirmed",
      "color": "D73A4A",
      "description": "This fix has been confirmed"
    },
    "bugConfirmed": {
      "name": "Bug - Confirmed",
      "color": "D73A4A",
      "description": "This bug has been confirmed"
    },
    "new": {
      "name": "Bug - New",
      "color": "D73A4A",
      "description": "This bug is new"
    },
    "fixed": {
      "name": "Bug - Fixed",
      "color": "D73A4A",
      "description": "This bug has been fixed"
    },
    "claSigned": {
      "name": "CLA - Signed",
      "color": "dd6127",
      "description": "Contributor License Agreement has been signed"
    },
    "claUnsigned": {
      "name": "CLA - Unsigned",
      "color": "dd6127",
      "description": "Contributor License Agreement has not been signed"
    },
    "claNot Required": {
      "name": "CLA - Not Required",
      "color": "dd6127",
      "description": "Contributor License Agreement not required"
    },
    "major": {
      "name": "Versioning - Major",
      "color": "e580c8",
      "description": "Major version to be incremented due to of backwards incompatible changes are introduced"
    },
    "minor": {
      "name": "Versioning - Minor",
      "color": "e580c8",
      "description": "Minor version to be incremented due to substantial new functionality or improvements are introduced"
    },
    "patch": {
      "name": "Versioning - Patch",
      "color": "e580c8",
      "description": "Patch version to be incremented due to backwards compatible bug fixes are introduced."
    },
    "prerelease": {
      "name": "Versioning - Prerelease",
      "color": "e580c8",
      "description": "Prerelease of the next version."
    },
    "build": {
      "name": "Versioning - Build",
      "color": "e580c8",
      "description": "A build to represent dependencies updates and insignificant changes."
    },
    "breaking": {
      "name": "Versioning - BREAKING",
      "color": "e580c8",
      "description": "A breaking change"
    },
    "securityFix": {
      "name": "security fix",
      "color": "D1260F",
      "description": "A Security Fix"
    },
    "securityVulnerability": {
      "name": "security vulnerability",
      "color": "D1260F",
      "description": "A Security vulnerability"
    },
    "duplicate": {
      "name": "Duplicate",
      "color": "d4c5f9",
      "description": "A Duplicate of another issue/pull"
    },
    "help": {
      "name": "Help wanted",
      "color": "d4c5f9",
      "description": "Help is needed to continue"
    },
    "rebase": {
      "name": "Needs rebase",
      "color": "d4c5f9",
      "description": "This request needs to be rebased"
    },
    "wip": {
      "name": "Work in progress",
      "color": "d4c5f9",
      "description": "This pull request is a wip"
    },
    "moreInfo": {
      "name": "More information needed",
      "color": "d4c5f9",
      "description": "Requires more information before it can continue"
    },
    "firstIssue": {
      "name": "Good first issue",
      "color": "d4c5f9",
      "description": "A Good issue for first time github users"
    },
    "firstTimers": {
      "name": "First Timers",
      "color": "d4c5f9",
      "description": "A Good issue for first time github users"
    },
    "skipChangelog": {
      "name": "skip-changelog",
      "color": "d4c5f9",
      "description": "Skip the changelog"
    }
  },
  "runners": [
    {
      "root": ".",
      "projectType": "node",
      "versioning": "SemVer",
      "prereleaseName": "alpha",
      "sharedLabelsConfig": {
        "bug": {
          "requires": 1,
          "conditions": [
            {
              "type": "titleMatches",
              "pattern": "/^bug(\\(.*\\))?:/i"
            },
            {
              "type": "descriptionMatches",
              "pattern": "/(created|new|opened|made)( an| a)? bug/i"
            }
          ]
        },
        "chore": {
          "requires": 1,
          "conditions": [
            {
              "type": "titleMatches",
              "pattern": "/^chore(\\(.*\\))?:/i"
            }
          ]
        },
        "optimisation": {
          "requires": 2,
          "conditions": [
            {
              "type": "titleMatches",
              "pattern": "/^opt(\\(.*\\))?:/i"
            },
            {
              "type": "titleMatches",
              "pattern": "/^optimisation(\\(.*\\))?:/i"
            },
            {
              "type": "titleMatches",
              "pattern": "/^maint(\\(.*\\))?:/i"
            },
            {
              "type": "titleMatches",
              "pattern": "/^maintenance(\\(.*\\))?:/i"
            },
            {
              "type": "descriptionMatches",
              "pattern": "/^type:(,| |Style|Refactoring|Revert|Deprecated|Removal)*optimisation/im"
            }
          ]
        },
        "style": {
          "requires": 2,
          "conditions": [
            {
              "type": "titleMatches",
              "pattern": "/^style(\\(.*\\))?:/i"
            },
            {
              "type": "titleMatches",
              "pattern": "/^maint(\\(.*\\))?:/i"
            },
            {
              "type": "titleMatches",
              "pattern": "/^maintenance(\\(.*\\))?:/i"
            },
            {
              "type": "descriptionMatches",
              "pattern": "/^type:(,| |Refactoring|Optimisation|Revert|Deprecated|Removal)*style/im"
            }
          ]
        },
        "refactor": {
          "requires": 2,
          "conditions": [
            {
              "type": "titleMatches",
              "pattern": "/^ref(\\(.*\\))?:/i"
            },
            {
              "type": "titleMatches",
              "pattern": "/^refactor(\\(.*\\))?:/i"
            },
            {
              "type": "titleMatches",
              "pattern": "/^maint(\\(.*\\))?:/i"
            },
            {
              "type": "titleMatches",
              "pattern": "/^maintenance(\\(.*\\))?:/i"
            },
            {
              "type": "descriptionMatches",
              "pattern": "/^type:(,| |Style|Optimisation|Revert|Deprecated|Removal)*refactoring/im"
            }
          ]
        },
        "revert": {
          "requires": 2,
          "conditions": [
            {
              "type": "titleMatches",
              "pattern": "/^revert(\\(.*\\))?:/i"
            },
            {
              "type": "titleMatches",
              "pattern": "/^maint(\\(.*\\))?:/i"
            },
            {
              "type": "titleMatches",
              "pattern": "/^maintenance(\\(.*\\))?:/i"
            },
            {
              "type": "descriptionMatches",
              "pattern": "/^type:(,| |Style|Refactoring|Optimisation|Deprecated|Removal)*revert/im"
            }
          ]
        },
        "deprecated": {
          "requires": 2,
          "conditions": [
            {
              "type": "titleMatches",
              "pattern": "/^dep(\\(.*\\))?:/i"
            },
            {
              "type": "titleMatches",
              "pattern": "/^deprecated(\\(.*\\))?:/i"
            },
            {
              "type": "titleMatches",
              "pattern": "/^maint(\\(.*\\))?:/i"
            },
            {
              "type": "titleMatches",
              "pattern": "/^maintenance(\\(.*\\))?:/i"
            },
            {
              "type": "descriptionMatches",
              "pattern": "/^type:(,| |Style|Refactoring|Optimisation|Revert|Removal)*deprecated/im"
            }
          ]
        },
        "removal": {
          "requires": 2,
          "conditions": [
            {
              "type": "titleMatches",
              "pattern": "/^removal(\\(.*\\))?:/i"
            },
            {
              "type": "titleMatches",
              "pattern": "/^maint(\\(.*\\))?:/i"
            },
            {
              "type": "titleMatches",
              "pattern": "/^maintenance(\\(.*\\))?:/i"
            },
            {
              "type": "descriptionMatches",
              "pattern": "/^type:(,| |Style|Refactoring|Optimisation|Revert|Deprecated)*removal/im"
            }
          ]
        },
        "discussion": {
          "requires": 1,
          "conditions": [
            {
              "type": "titleMatches",
              "pattern": "/^discussion(\\(.*\\))?:/i"
            }
          ]
        },
        "documentation": {
          "requires": 1,
          "conditions": [
            {
              "type": "titleMatches",
              "pattern": "/^docs(\\(.*\\))?:/i"
            },
            {
              "type": "titleMatches",
              "pattern": "/^documentation(\\(.*\\))?:/i"
            }
          ]
        },
        "feature": {
          "requires": 1,
          "conditions": [
            {
              "type": "titleMatches",
              "pattern": "/^feat(\\(.*\\))?:/i"
            },
            {
              "type": "titleMatches",
              "pattern": "/^enhance(\\(.*\\))?:/i"
            },
            {
              "type": "titleMatches",
              "pattern": "/^feature(\\(.*\\))?:/i"
            },
            {
              "type": "titleMatches",
              "pattern": "/^enhancement(\\(.*\\))?:/i"
            }
          ]
        },
        "fix": {
          "requires": 1,
          "conditions": [
            {
              "type": "titleMatches",
              "pattern": "/^fix(\\(.*\\))?:/i"
            }
          ]
        },
        "workflow": {
          "requires": 1,
          "conditions": [
            {
              "type": "titleMatches",
              "pattern": "/^.*\\(workflow\\):/i"
            }
          ]
        },
        "releaseMastermind": {
          "requires": 1,
          "conditions": [
            {
              "type": "descriptionMatches",
              "pattern": "/^- package\\(s\\):.*(@videndum\\/)?release-mastermind.*/im"
            },
            {
              "type": "titleMatches",
              "pattern": "/^.*\\(release\\):/i"
            }
          ]
        },
        "labelMastermind": {
          "requires": 1,
          "conditions": [
            {
              "type": "descriptionMatches",
              "pattern": "/^- package\\(s\\):.*(@videndum\\/)?label-mastermind.*/im"
            },
            {
              "type": "titleMatches",
              "pattern": "/^.*\\(label\\):/i"
            }
          ]
        },
        "variableMastermind": {
          "requires": 1,
          "conditions": [
            {
              "type": "descriptionMatches",
              "pattern": "/^- package\\(s\\):.*(@videndum\\/)?variable-mastermind.*/im"
            },
            {
              "type": "titleMatches",
              "pattern": "/^.*\\(variable\\):/i"
            }
          ]
        },
        "installer": {
          "requires": 1,
          "conditions": [
            {
              "type": "descriptionMatches",
              "pattern": "/^- package\\(s\\):.*(@videndum\\/)?action-masterminds.*/im"
            },
            {
              "type": "titleMatches",
              "pattern": "/^.*\\(installer\\):/i"
            }
          ]
        },
        "priorityCritical": {
          "requires": 1,
          "conditions": [
            {
              "type": "titleMatches",
              "pattern": "!:.*(critical|urgent)?|!?:.*(critical|urgent)"
            }
          ]
        }
      },
      "pr": {
        "labels": {
          "xs": {
            "requires": 1,
            "conditions": [
              {
                "type": "changesSize",
                "min": 0,
                "max": 10
              }
            ]
          },
          "s": {
            "requires": 1,
            "conditions": [
              {
                "type": "changesSize",
                "min": 10,
                "max": 30
              }
            ]
          },
          "m": {
            "requires": 1,
            "conditions": [
              {
                "type": "changesSize",
                "min": 40,
                "max": 100
              }
            ]
          },
          "l": {
            "requires": 1,
            "conditions": [
              {
                "type": "changesSize",
                "min": 100,
                "max": 500
              }
            ]
          },
          "xl": {
            "requires": 1,
            "conditions": [
              {
                "type": "changesSize",
                "min": 500,
                "max": 1000
              }
            ]
          },
          "xxl": {
            "requires": 1,
            "conditions": [
              {
                "type": "changesSize",
                "min": 1000
              }
            ]
          },
          "fixConfirmed": {
            "requires": 6,
            "conditions": [
              {
                "type": "descriptionMatches",
                "pattern": "/^- \\[x\\] fix Confirmed by ((@.*& .*){4,}|(@.*& )*@(tgtgamer|videndum\\/.*))/im"
              },
              {
                "type": "descriptionMatches",
                "pattern": "/^- \\[x\\] have fixed on a clean installation/im"
              },
              {
                "type": "descriptionMatches",
                "pattern": "/^- \\[x\\] have fixed on a stable build/im"
              },
              {
                "type": "descriptionMatches",
                "pattern": "/^- \\[x\\] have fixed on a development build/im"
              },
              {
                "type": "descriptionMatches",
                "pattern": "/^- \\[x\\] have included logs or screenshots/im"
              },
              {
                "type": "descriptionMatches",
                "pattern": "/^- \\[x\\] have linked any related/im"
              }
            ]
          },
          "devOpsReviewing": {
            "requires": 1,
            "conditions": [
              {
                "type": "pendingReview",
                "value": true
              }
            ]
          },
          "devOpsRejected": {
            "requires": 1,
            "conditions": [
              {
                "type": "requestedChanges",
                "value": true
              }
            ]
          }
        }
      },
      "issue": {
        "ref": "develop",
        "labels": {
          "android": {
            "requires": 1,
            "conditions": [
              {
                "type": "descriptionMatches",
                "pattern": "/^- platform:.*android/im"
              }
            ]
          },
          "aws": {
            "requires": 1,
            "conditions": [
              {
                "type": "descriptionMatches",
                "pattern": "/^- platform:.*aws/im"
              },
              {
                "type": "descriptionMatches",
                "pattern": "/^- platform:.*amazon web service/im"
              }
            ]
          },
          "google": {
            "requires": 1,
            "conditions": [
              {
                "type": "descriptionMatches",
                "pattern": "/^- platform:.*google/im"
              }
            ]
          },
          "ios": {
            "requires": 1,
            "conditions": [
              {
                "type": "descriptionMatches",
                "pattern": "/^- platform:.*ios/im"
              }
            ]
          },
          "ubuntu": {
            "requires": 1,
            "conditions": [
              {
                "type": "descriptionMatches",
                "pattern": "/^- platform:.*ubuntu/im"
              }
            ]
          },
          "fedora": {
            "requires": 1,
            "conditions": [
              {
                "type": "descriptionMatches",
                "pattern": "/^- platform:.*fedora/im"
              }
            ]
          },
          "debian": {
            "requires": 1,
            "conditions": [
              {
                "type": "descriptionMatches",
                "pattern": "/^- platform:.*debian/im"
              }
            ]
          },
          "macos": {
            "requires": 1,
            "conditions": [
              {
                "type": "descriptionMatches",
                "pattern": "/^- platform:.*macos/im"
              }
            ]
          },
          "windows": {
            "requires": 1,
            "conditions": [
              {
                "type": "descriptionMatches",
                "pattern": "/^- platform:.*windows/im"
              }
            ]
          },
          "bugConfirmed": {
            "requires": 8,
            "conditions": [
              {
                "type": "descriptionMatches",
                "pattern": "/^- \\[x\\] bug Confirmed by ((@.*& .*){4,}|(@.*& )*@(tgtgamer|videndum\\/.*))/im"
              },
              {
                "type": "descriptionMatches",
                "pattern": "/^- \\[x\\] have reproduced on my application version/im"
              },
              {
                "type": "descriptionMatches",
                "pattern": "/^- \\[x\\] have reproduced on a clean installation/im"
              },
              {
                "type": "descriptionMatches",
                "pattern": "/^- \\[x\\] have reproduced on a development build/im"
              },
              {
                "type": "descriptionMatches",
                "pattern": "/^- \\[x\\] have included logs or screenshots/im"
              },
              {
                "type": "descriptionMatches",
                "pattern": "/^- \\[x\\] have contacted support/im"
              },
              {
                "type": "descriptionMatches",
                "pattern": "/^- \\[x\\] have asked the community/im"
              },
              {
                "type": "descriptionMatches",
                "pattern": "/^- \\[x\\] have linked any related/im"
              }
            ]
          },
          "fixConfirmed": {
            "requires": 6,
            "conditions": [
              {
                "type": "descriptionMatches",
                "pattern": "/^- \\[x\\] fix Confirmed by ((@.*& .*){4,}|(@.*& )*@(tgtgamer|videndum\\/.*))/im"
              },
              {
                "type": "descriptionMatches",
                "pattern": "/^- \\[x\\] have fixed on a clean installation/im"
              },
              {
                "type": "descriptionMatches",
                "pattern": "/^- \\[x\\] have fixed on a stable build/im"
              },
              {
                "type": "descriptionMatches",
                "pattern": "/^- \\[x\\] have fixed on a development build/im"
              },
              {
                "type": "descriptionMatches",
                "pattern": "/^- \\[x\\] have included logs or screenshots/im"
              },
              {
                "type": "descriptionMatches",
                "pattern": "/^- \\[x\\] have linked any related/im"
              }
            ]
          }
        }
      },
      "project": {
        "ref": "develop",
        "labels": {
          "available": {
            "requires": 1,
            "conditions": [
              {
                "type": "onColumn",
                "project": "Developer Operations",
                "column": "Requested"
              }
            ]
          },
          "pending": {
            "requires": 1,
            "conditions": [
              {
                "type": "onColumn",
                "project": "Developer Operations",
                "column": "Accepted"
              }
            ]
          },
          "progress": {
            "requires": 1,
            "conditions": [
              {
                "type": "onColumn",
                "project": "Developer Operations",
                "column": "In Progress"
              },
              {
                "type": "onColumn",
                "project": "Developer Operations",
                "column": "Testing"
              }
            ]
          },
          "review": {
            "requires": 1,
            "conditions": [
              {
                "type": "onColumn",
                "project": "Developer Operations",
                "column": "Reviewing"
              }
            ]
          },
          "completed": {
            "requires": 1,
            "conditions": [
              {
                "type": "onColumn",
                "project": "Developer Operations",
                "column": "Completed"
              }
            ]
          },
          "doNotDevelop": {
            "requires": 1,
            "conditions": [
              {
                "type": "onColumn",
                "project": "Developer Operations",
                "column": "Rejected"
              }
            ]
          },
          "devOpsAccepted": {
            "requires": 1,
            "conditions": [
              {
                "type": "onColumn",
                "project": "Developer Operations",
                "column": "Accepted"
              }
            ]
          },
          "devOpsDeveloping": {
            "requires": 1,
            "conditions": [
              {
                "type": "onColumn",
                "project": "Developer Operations",
                "column": "In Progress"
              }
            ]
          },
          "devOpsTesting": {
            "requires": 1,
            "conditions": [
              {
                "type": "onColumn",
                "project": "Developer Operations",
                "column": "Testing"
              }
            ]
          },
          "devOpsReviewing": {
            "requires": 1,
            "conditions": [
              {
                "type": "onColumn",
                "project": "Developer Operations",
                "column": "Reviewing"
              }
            ]
          },
          "devOpsStaging": {
            "requires": 1,
            "conditions": [
              {
                "type": "onColumn",
                "project": "Developer Operations",
                "column": "Staging"
              }
            ]
          },
          "devOpsCompleted": {
            "requires": 1,
            "conditions": [
              {
                "type": "onColumn",
                "project": "Developer Operations",
                "column": "Completed"
              }
            ]
          },
          "devOpsRejected": {
            "requires": 1,
            "conditions": [
              {
                "type": "onColumn",
                "project": "Developer Operations",
                "column": "Rejected"
              }
            ]
          },
          "priorityLow": {
            "requires": 1,
            "conditions": [
              {
                "type": "onColumn",
                "project": "Issues",
                "column": "Low Priority"
              }
            ]
          },
          "priorityMedium": {
            "requires": 1,
            "conditions": [
              {
                "type": "onColumn",
                "project": "Issues",
                "column": "Medium Priority"
              }
            ]
          },
          "priorityHigh": {
            "requires": 1,
            "conditions": [
              {
                "type": "onColumn",
                "project": "Issues",
                "column": "High Priority"
              }
            ]
          },
          "priorityCritical": {
            "requires": 2,
            "conditions": [
              {
                "type": "onColumn",
                "project": "Issues",
                "column": "High Priority"
              },
              {
                "type": "titleMatches",
                "pattern": "!:.*(critical|urgent)?|!?:.*(critical|urgent)"
              }
            ]
          }
        }
      }
    }
  ]
}
```

</details>

Be sure that Github Actions is enabled for in your repository's settings. The action will now run on your issues, projects and pull requests.

### All configuration options

Due to the nature of this project. Most of the options have been documented as tables of information for your convinience. However Where this isn't partically helpful or easy to do, we have used the `Typing` from our typescript files to showcase the option.

| Option  | Required | Description                                | Params                  |
| ------- | -------- | ------------------------------------------ | ----------------------- |
| labels  | false    | Defines all the labels within the repo     | `Labels`                |
| runners | true     | Defines the configuration for each project | [`Runners[]`](#runners) |

#### Runners

You can have multiple runners, which allows for configuration for monorepo projects.

| Option             | Required | Description                                 | Params                                    |
| ------------------ | -------- | ------------------------------------------- | ----------------------------------------- |
| Root               | true     | Defines the root of the project             | `string`                                  |
| projectType        | true     | Defines the type of project                 | `"node" | "other"`                        |
| versioning         | false    | Defines the versioning of the project       | `"SemVer" | "other"`                      |
| prereleaseName     | false    | Defines the name of a prerelease            | `string`                                  |
| sharedLabelsConfig | false    | Defines labels to use on both PR and Issues | [`SharedLabels`](#sharedlabels)           |
| pr                 | false    | Defines the configuration for Pull Requests | [`PullRequestConfig`](#pullrequestconfig) |
| issue              | false    | Defines the configuration for issues        | [`IssueConfig`](#issueconfig)             |
| project            | false    | Defines the configuration for projects      | [`ProjectConfig`](#projectconfig)         |

#### PullRequestConfig

| Option             | Required | Description                                   | Params                                                   |
| ------------------ | -------- | --------------------------------------------- | -------------------------------------------------------- |
| ref                | false    | Overrides the reference                       | `string`                                                 |
| enforceConventions | false    | Enforces conventions                          | [`EnforceConventions`](#enforceconventions)              |
| labels             | false    | Apply labels automatically                    | [`[Key: string]: PRConditionConfig`](#prconditionconfig) |
| automaticApprove   | false    | Automatically approved PR based on conditions | [`AutomaticApprove`](#automaticapprove)                  |
| manageRelease      | false    | Manage releases                               | [`Release`](#release)                                    |
| duplicateHotfix    | false    | Duplicate a hotfix to the `main` branch       | [`[title: string]: DuplicateHotfix`](#duplicatehotfix)   |
| syncRemote         | false    | Syncronise a remote repository                | [`SyncRemote[]`](#syncremote)                            |
| assignProject      | false    | Automatically assign to projects              | [`AssignProject[]`](#assignproject)                      |

##### EnforceConventions

| Option        | Required | Description                                                             | Params                                                  |
| ------------- | -------- | ----------------------------------------------------------------------- | ------------------------------------------------------- |
| onColumn      | false    | (if project card ) Which column should trigger this action              | `column[ String | Number ]`                             |
| commentHeader | false    | A comment to append to the header of failed comments                    | `string`                                                |
| commentFooter | false    | A comment to append to the footer of failed comments                    | `string`                                                |
| moveToColumn  | false    | (if project card) Optionally move the card to another column on failure | `String | Number`                                       |
| Conventions   | true     | The conventions to enforce                                              | [`SharedConventionsConfig[]`](#sharedconventionsconfig) |

##### AssignProject

| Option  | Required | Description                                                    | Params   |
| ------- | -------- | -------------------------------------------------------------- | -------- |
| owner   | false    | The owner of the project (organisation)                        | `string` |
| user    | false    | The user which owns the project (user)                         | `string` |
| repo    | false    | The repo which contains teh project (requires owner to be set) | `string` |
| project | true     | The name of the project to assign                              | `string` |
| column  | true     | The column within the project to assign                        | `string` |

##### SharedConventionsConfig

| Option        | Required | Description                                           | Params                          |
| ------------- | -------- | ----------------------------------------------------- | ------------------------------- |
| requires      | true     | The number of conditions this requires                | `number`                        |
| failedComment | true     | A comment to respond with should this convention fail | `string`                        |
| conditions    | true     | The conditions to check against                       | `Condition[] | "semanticTitle"` |
| contexts      | false    | (if using `"semanticTitle"`) contexts to use          | `string[]`                      |

Choosing `"semanticTitle"` as the condition will automatically configure your conventions to use semantic conventions. You can add additional context by adding the `contexts` option which enforce only those contexts get used.

##### AutomaticApprove

| Option        | Required | Description                                          | Params                                                  |
| ------------- | -------- | ---------------------------------------------------- | ------------------------------------------------------- |
| commentHeader | false    | A comment to append to the header of failed comments | `string`                                                |
| commentFooter | false    | A comment to append to the footer of failed comments | `string`                                                |
| Conventions   | true     | The conventions to enforce                           | [`SharedConventionsConfig[]`](#sharedconventionsconfig) |

##### Release

| Option           | Required  | Description                                       | Params                                |
| ---------------- | --------- | ------------------------------------------------- | ------------------------------------- |
| labels           | sometimes | Defines the labels to use within automation tasks | [`ReleaseLabels`](#releaselabels)     |
| createTag        | false     | Should this action create a tag?                  | `boolean`                             |
| createRelease    | false     | Create a github release                           | [`CreateRelease`](#createrelease)     |
| createMilestones | false     | Create a milestone                                | [`CreateMilestone`](#createmilestone) |
| createPackages   | false     | Commands to use when creating packages            | `String[] | string`                   |
| createChangelog  | false     | Create a changelog                                | [`Changelog`](#changelog)             |

##### ReleaseLabels

| Option     | Required | Description                                                                                                              | Params   |
| ---------- | -------- | ------------------------------------------------------------------------------------------------------------------------ | -------- |
| build      | true     | A tag to represent dependencies updates and insignificant changes                                                        | `string` |
| prerelease | true     | A tag to represent a prerelease of the next version.                                                                     | `string` |
| patch      | true     | A tag to represent a Patch version to be incremented due to backwards compatible bug fixes are introduced.               | `string` |
| minor      | true     | A tag to represent a Minor version to be incremented due to substantial new functionality or improvements are introduced | `string` |
| major      | true     | A tag to represent a Major version to be incremented due to of backwards incompatible changes are introduced             | `string` |
| breaking   | true     | A tag to represent a breaking change                                                                                     | `string` |

##### CreateRelease

| Option            | Required | Description                                        | Params                    |
| ----------------- | -------- | -------------------------------------------------- | ------------------------- |
| includeIssues     | false    | Should issues be included in release               | `boolean`                 |
| sections          | false    | The sections configureation                        | [`Sections[]`](#sections) |
| tagName           | false    | The name of the tag to create                      | `string`                  |
| tagPrefix         | false    | The prefix before the tagName                      | `string`                  |
| releaseName       | false    | The name of the release                            | `string`                  |
| releaseNamePrefix | false    | The prefix before the releaseName                  | `string`                  |
| releaseNameSuffix | false    | The Suffex before the releaseName                  | `string`                  |
| draft             | false    | Should the release be draft                        | `boolean`                 |
| prerelease        | false    | Should the release be a prerelease                 | `boolean`                 |
| useChangelog      | false    | Should the release use the changelog configuration | `boolean`                 |

##### Changelog

| Option        | Required | Description                                 | Params                    |
| ------------- | -------- | ------------------------------------------- | ------------------------- |
| includeIssues | false    | Should issues be included in release        | `boolean`                 |
| sections      | false    | The sections configureation                 | [`Sections[]`](#sections) |
| title         | false    | The title for the changelog                 | `string`                  |
| body          | false    | The changelog body which should be included | `string`                  |

###### Sections

| Option           | Required | Description                           | Params     |
| ---------------- | -------- | ------------------------------------- | ---------- |
| title            | true     | The title of section                  | `string`   |
| body             | false    | A body to add to this section         | `string`   |
| PRlabels         | true     | The pull request labels to include    | `string[]` |
| issueLabels      | false    | The issue labels to include           | `string[]` |
| includeCommitter | false    | Should include the committer username | `boolean`  |
| linkPR           | false    | Should link the pull request          | `boolean`  |

##### CreateMilestone

| Option    | Required | Description                                              | Params               |
| --------- | -------- | -------------------------------------------------------- | -------------------- |
| milestone | true     | The milestone you want to use                            | `"version" | string` |
| deadline  | false    | The date in which you want to set as the completion date | `string`             |

##### DuplicateHotfix

| Option      | Required | Description                                    | Params                            |
| ----------- | -------- | ---------------------------------------------- | --------------------------------- |
| prName      | true     | What should the pull request be named          | `"unchanged" | "number" | string` |
| titlePrefix | false    | Should there be a title prefix                 | `string`                          |
| branches    | false    | What banches should have the duplicated hotfix | `string[]`                        |

##### SyncRemote

| Option       | Required | Description                        | Params   |
| ------------ | -------- | ---------------------------------- | -------- |
| localBranch  | true     | Which branch should be syncronised | `string` |
| remoteBranch | true     | Which branch should be syncronised | `string` |
| localPath    | true     | Which path should be synconised    | `string` |
| remotePath   | true     | Which path should be syncronised   | `string` |

#### IssueConfig

| Option             | Required | Description                                    | Params                                                   |
| ------------------ | -------- | ---------------------------------------------- | -------------------------------------------------------- |
| ref                | false    | Overrides the reference                        | `string`                                                 |
| enforceConventions | false    | Enforces conventions                           | [`EnforceConventions`](#enforceconventions)              |
| labels             | false    | Apply labels automatically                     | [`[Key: string]: PRConditionConfig`](#prconditionconfig) |
| assignProject      | false    | Automatically assign to projects               | [`AssignProject[]`](#assignproject)                      |
| createBranch       | false    | Automatically create branches on configuration | [`[label: string]: CreateBranch`](#createbranch)         |

##### CreateBranch

| Option       | Required | Description                     | Params                         |
| ------------ | -------- | ------------------------------- | ------------------------------ |
| branchPrefix | false    | Should the branch have a prefix | `string`                       |
| branchSuffix | false    | Should the branch have a suffix | `string`                       |
| branchName   | false    | Branch name                     | `'title' | 'short' | 'number'` |

`'title'` - Use the entire title
`'short'` - Use the first 3 words
`'number'` - Use the issue number

#### ProjectConfig

| Option             | Required | Description                                    | Params                                                   |
| ------------------ | -------- | ---------------------------------------------- | -------------------------------------------------------- |
| ref                | false    | Overrides the reference                        | `string`                                                 |
| enforceConventions | false    | Enforces conventions                           | [`EnforceConventions`](#enforceconventions)              |
| labels             | false    | Apply labels automatically                     | [`[Key: string]: PRConditionConfig`](#prconditionconfig) |
| syncRemote         | false    | Syncronise remote projects (e.g. org projects) | [`ExProjects[]`](#exprojects)                            |
| openBranch         | false    | Create Branch based on config                  | [`ProjectCreateBranch`](#projectcreatebranch)            |
| assignMilestone    | false    | Automatically assign to milestones             | [`[milestone: string]: Milestones`](#milestones)         |

##### ExProjects

| Option  | Required | Description                                                    | Params   |
| ------- | -------- | -------------------------------------------------------------- | -------- |
| owner   | false    | The owner of the project (organisation)                        | `string` |
| user    | false    | The user which owns the project (user)                         | `string` |
| repo    | false    | The repo which contains teh project (requires owner to be set) | `string` |
| project | true     | The name of the project to assign                              | `string` |

##### ProjectCreateBranch

| Option       | Required | Description                     | Params                         |
| ------------ | -------- | ------------------------------- | ------------------------------ |
| onProject    | false    | Which project shoud be used     | `string`                       |
| onColumn     | false    | Which column should be used     | `string | number`              |
| branchPrefix | false    | Should the branch have a prefix | `string`                       |
| branchSuffix | false    | Should the branch have a suffix | `string`                       |
| branchName   | false    | Branch name                     | `'title' | 'short' | 'number'` |

`'title'` - Use the entire title
`'short'` - Use the first 3 words
`'number'` - Use the issue number

##### Milestones

| Option       | Required | Description                    | Params     |
| ------------ | -------- | ------------------------------ | ---------- |
| onColumn     | true     | Which column should be used    | `string`   |
| ignoreLabels | false    | Labels which should be ignored | `string[]` |


#### Typings

<details>
    <summary><b>Types</b></summary>

```typescript
import {
  IssueCondition,
  PRCondition,
  Condition,
  ProjectCondition
} from './src/conditions/'

export interface IssueConditionConfig {
  requires: number
  conditions: IssueCondition[]
}

export interface PRConditionConfig {
  requires: number
  conditions: PRCondition[]
}

export interface SharedConfig {
  requires: number
  conditions: Condition[]
}

export interface Runners {
  labels?: Labels
  runners: Config[]
}

export interface Config {
  projectType: ProjectType
  root: string
  versioning?: VersionType
  labels?: { [key: string]: string }
  sharedLabelsConfig: SharedLabels
  issue: IssueConfig
  pr: PullRequestConfig
  project: ProjectConfig
  skip_labeling: string
  delete_labels: boolean
}

interface SharedLabels {
  [key: string]: SharedConditions
}
export interface SharedConditions {
  requires: number
  conditions: Condition[]
}
export interface IssueConfig {
  ref?: string
  labels: {
    [key: string]: IssueConditionConfig
  }
}
export interface PullRequestConfig {
  ref?: string
  labels: {
    [key: string]: PRConditionConfig
  }
}
export interface ProjectConfig {
  ref?: string
  labels: {
    [key: string]: SharedConfig
  }
}
export interface ProjectConditionConfig {
  requires: number
  conditions: ProjectCondition[]
}
export interface Label {
  name: string
  description: string
  color: string
}

export interface Labels {
  [key: string]: Label
}

export interface Options {
  configPath: string
  configJSON: Runners
  showLogs: boolean
  dryRun: boolean
}

export type ProjectType = 'node' | 'other'
export type VersionType = 'SemVer'
```

</details>
### Using Regex Patterns

Many conditions use regular expressions (usually with a `pattern` parameter).
Since these regular expressions are passed in through JSON strings, there are
some things to pay attention to.

Special characters must be double escaped: `pattern: "\\W+$"` is equivalent to the Regex: `/\W+$/`.

If you want to use flags, use the following format: `pattern: "/^wip:/i"` is equivalent to the Regex: `/^wip:/i`.

## Available Conditions

For complex conditions, you can use conditional options such as `only`, `$and` and `$or`. They can be found within the common conditions section. 

### Common Conditions

#### $and

Allows conditions to be combined to create more advanced conditions. Would require all conditions to return true otherwise it would fail.

```json
{
  "type": "$and",
  "pattern": [
    {
      "requires": 1, 
      "conditions": []
    },
    {
      "requires": 1, 
      "conditions": []
    },
  ]
}
```

#### creatorMatches

Checks if an issue or pull request's creator's username matches a Regex pattern.

Example:

```json
{
  "type": "creatorMatches",
  "pattern": "^foo"
}
```

#### descriptionMatches

Checks if an issue or pull request's description matches a Regex pattern.

Example:

```json
{
  "type": "descriptionMatches",
  "pattern": "foo.*bar"
}
```

#### hasLabel

Checks if an issue or pull request has a specific label applied.

Example:

```json
{
  "type": "hasLabel",
  "label": "Type - Bug",
  "value": "false"
}
```

#### isLocked

Checks if an issue or pull request is locked.

Example:

```json
{
  "type": "isLocked",
  "value": true
}
```

#### isOpen

Checks if an issue or pull request is open or closed.

Example:

```json
{
  "type": "isOpen",
  "value": true
}
```

#### $only

Requires only the number specified in `requires` to pass otherwise it fails.

```json
{
  "type": "$only",
  "requires": 1,
  "pattern": [
    {
      "requires": 1, 
      "conditions": []
    },
    {
      "requires": 1, 
      "conditions": []
    },
  ]
}
```

#### $or

Allows conditions to be combined to create more advanced conditions. Would require one conditions to return true otherwise it would fail.

```json
{
  "type": "$or",
  "pattern": [
    {
      "requires": 1, 
      "conditions": []
    },
    {
      "requires": 1, 
      "conditions": []
    },
  ]
}
```


### Pull Request Conditions

#### branchMatches

Checks if branch name matches a Regex pattern.

Example:

```json
{
  "type": "branchMatches",
  "pattern": "^bugfix\\/"
}
```

#### changesSize

Checks if an pull request's changes against `min` & `max` values. Note: if `max` is `undefined` assumed value is `unlimited`

Example:

```json
{
  "type": "changesSize",
  "min": 0,
  "max": 100
}
```

#### filesMatch

Checks if the files modified in the pull request match a glob.

Globs are matched using the [minimatch](https://github.com/isaacs/minimatch) library.

Example:

```json
{
  "type": "filesMatch",
  "glob": "src/foo/**/*"
}
```

#### isApproved

Checks if a pull request has requested a review.

Example:

```json
{
  "type": "isApproved",
  "value": true,
  "required": 1
}
```

#### isDraft

Checks if a pull request is a draft.

Example:

```json
{
  "type": "isDraft",
  "value": true
}
```

#### pendingReview

Checks if a pull request has requested a review.

Example:

```json
{
  "type": "pendingReview",
  "value": true
}
```

#### requestedChanges

Checks if a pull request has requested a review.

Example:

```json
{
  "type": "requestedChanges",
  "value": true
}
```

### Issue Conditions


### Project Conditions

#### onColumn

Checks if branch name matches a Regex pattern.

Example:

```json
{
  "type": "branchMatches",
  "pattern": "^bugfix\\/"
}
```

## Final Note

Thank you for taking the time to look through this repository. If you have liked what you have found, please would you favourite & share. Ideally I would like to get a community behind this project which can ensure that it is maintained, updated and improved as GitActions get more suffisticated.

This project took heavy infulence from [IvanFon/super-labeler-action](https://github.com/IvanFon/super-labeler-action) which we are actively maintaining on our fork here: [Videndum/forked-super-labeler-action](https://github.com/Videndum/forked-super-labeler-action). We invite any of the team who worked on his project to come onboard with our version and intend to continue maintaining for a significant while.
