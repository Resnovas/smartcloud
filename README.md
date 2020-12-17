# Mastermind Collection

Welcome to the Github Action Mastermind collection. This is the mono-repository for Videndum's collection of superpowered actions. This collection is built to work together as an univeral tool for Github Project management. For simplisity, our main tool - Release Mastermind - incorperates all our other tools within one simple action, which can be used in all your workflows to manage all your common tasks.

We designed this tool because the community tools either didn't have the features we wanted, or are not maintained. We wanted to create a single action which could do everything, or nothing, dependent on the configuration. This tool does exactly that, you choose how much or how little you want it to do...

Need reasons to consider using Release Manager?

- Everything is configured from either JSON or YAML files found within your `.github` folder for the repository. One file = no clutter.
- Automates all common tasks within a single action - Reduce the size of your workflow files
- Actively maintained - This project is actively maintained as it's the backbone of all our projects
- Works on any repository - No permissions required, simply use a Personal Access Token

## Index

- [Mastermind Collection](#mastermind-collection)
  - [Index](#index)
  - [Features](#features)
  - [How to get support 👨‍👩‍👧‍👦](#how-to-get-support-)
    - [Why not GitHub Issues?](#why-not-github-issues)
  - [Backlog & Contributing](#backlog--contributing)
  - [Running Locally & Developing](#running-locally--developing)
    - [Prerequisities](#prerequisities)
    - [Developing](#developing)
    - [Running locally](#running-locally)
  - [Getting Started](#getting-started)
    - [Automatic setup via CLI](#automatic-setup-via-cli)
    - [Manual setup](#manual-setup)
    - [Using Regex Patterns](#using-regex-patterns)
    - [All configuration options](#all-configuration-options)
      - [Runners](#runners)
      - [PullRequestConfig](#pullrequestconfig)
        - [EnforceConventions](#enforceconventions)
        - [AssignProject](#assignproject)
        - [SharedConventionsConfig](#sharedconventionsconfig)
        - [AutomaticApprove](#automaticapprove)
        - [Release](#release)
        - [ReleaseLabels](#releaselabels)
        - [CreateRelease](#createrelease)
        - [Changelog](#changelog)
          - [Sections](#sections)
        - [CreateMilestone](#createmilestone)
        - [DuplicateHotfix](#duplicatehotfix)
        - [SyncRemote](#syncremote)
      - [IssueConfig](#issueconfig)
        - [CreateBranch](#createbranch)
      - [ProjectConfig](#projectconfig)
        - [ExProjects](#exprojects)
        - [ProjectCreateBranch](#projectcreatebranch)
        - [Milestones](#milestones)
        - [SharedLabels](#sharedlabels)
        - [PRConditionConfig](#prconditionconfig)
    - [Available Conditions](#available-conditions)
      - [Conditional Conditions](#conditional-conditions)
        - [$and](#and)
        - [$or](#or)
        - [$only](#only)
      - [Common Conditions](#common-conditions)
        - [creatorMatches](#creatormatches)
        - [descriptionMatches](#descriptionmatches)
        - [hasLabel](#haslabel)
        - [isLocked](#islocked)
        - [isOpen](#isopen)
        - [titleMatches](#titlematches)
      - [Pull Request Conditions](#pull-request-conditions)
        - [branchMatches](#branchmatches)
        - [changesSize](#changessize)
        - [filesMatch](#filesmatch)
        - [isApproved](#isapproved)
        - [isDraft](#isdraft)
        - [pendingReview](#pendingreview)
        - [requestedChanges](#requestedchanges)
      - [Issue Conditions](#issue-conditions)
  - [Final Note](#final-note)

## Features

- Create, Update, Delete Labels declaratively from Config
- Apply Labels based on conditions
- Enforce Conventions - Ensure the repository follows conventions setout by your team. Configured using Conditions
- Automatically assign to projects - Ensure your projects have all open issues and pull requests assigned to the correct locations.
- Synchronise project boards - Keep remote project boards up to date with repo boards. Useful for multi-repo projects or big organisations.
- Automatically assign to milestones - Keep milestones upto date by automatically assigning issues and pull requests
- Automatically create Branches - Open branches based on project column, or when an issue is opened.
- Hotfix duplication - Automatically duplicate Hotfix pull requests to the `main` branch.
- Automatically approve - Setup automatic pull request approval based on conditions.
- Automatically bump version - Automatically increase the version of your project - Optionally use tags.
- Automatically package and release - Specify commands to run when new release should be created.
- Create Changelogs - Automatically create changelogs for your project.
- Create milestones automatically - Automatically create milestones when a new release is published.
- Automatically maintain `main` and `dev` branches - Create pull requests from `dev` to `main` and automatically approve them based on config.
- Automatically syncronise branches or folders with remote repository.

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

<!-- ### Automatic setup (Using Repository Template)

Setting up our actions shouldn't take long, it would defeat the purpose. Simplest way to get started is to click that `Use this template` button! Our template will automatically be built by Github, which will trigger our workflows which cleanup and setup everything for you.

[Use this template!](https://github.com/Videndum/workflow-mastermind/generate) -->

### Automatic setup via CLI

[coming soon]

### Manual setup

Create a new Github Actions workflow at `.github/workflows/releaseMastermind.yml`:

_Note: `actions/checkout` must be run first so that the release action can find your config file._

```yaml
on:
  issues:
  pull_request:
  project_card:

jobs:
  release:
    runs-on: ubuntu-latest
    name: Mastermind behind all realse actions
    steps:
      - uses: actions/checkout@v2
      - uses: Videndum/release-mastermind@latest
        with:
          github-token: '${{ secrets.GITHUB_TOKEN }}'
          config: .github/allconfigs.json
```

Now create the labeler config file at `.github/labels.json`:

```json
{
  "labels": {
    "example": {
      "name": "example",
      "colour": "#00ff00",
      "description": "Example label"
    }
  },
  "issue": {
    "example": {
      "requires": 2,
      "conditions": [
        {
          "type": "titleMatches",
          "pattern": "example"
        },
        {
          "type": "isOpen"
        }
      ]
    }
  },
  "pr": {
    "example": {
      "requires": 1,
      "conditions": [
        {
          "type": "isDraft",
          "value": false
        }
      ]
    }
  },
  "skip_labeling": true,
  "delete_labels": true
}
```

Be sure that Github Actions is enabled for in your repository's settings. Release Mastermind will now run on your issues, projects and pull requests.

### Using Regex Patterns

Many conditions use regular expressions (usually with a `pattern` parameter).
Since these regular expressions are passed in through JSON strings, there are
some things to pay attention to.

Special characters must be double escaped: `pattern: "\\W+$"` is equivalent to the Regex: `/\W+$/`.

If you want to use flags, use the following format: `pattern: "/^wip:/i"` is equivalent to the Regex: `/^wip:/i`.

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

##### SharedLabels

```ts
interface SharedLabels {
  [key: string]: SharedConditions
}
interface SharedConditions {
  requires: number
  conditions: Condition[]
}
```

##### PRConditionConfig

```ts
export interface PRConditionConfig {
  requires: number
  conditions: PRCondition[]
}
```

### Available Conditions

For complex conditions, you can use conditional options such as `only`, `$and` and `$or`.

#### Conditional Conditions

##### $and

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

##### $or

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

##### $only

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

#### Common Conditions

##### creatorMatches

Checks if an issue or pull request's creator's username matches a Regex pattern.

Example:

```json
{
  "type": "creatorMatches",
  "pattern": "^foo"
}
```

##### descriptionMatches

Checks if an issue or pull request's description matches a Regex pattern.

Example:

```json
{
  "type": "descriptionMatches",
  "pattern": "foo.*bar"
}
```

##### hasLabel

Checks if an issue or pull request has a specific label applied.

Example:

```json
{
  "type": "hasLabel",
  "label": "Type - Bug",
  "value": "false"
}
```

##### isLocked

Checks if an issue or pull request is locked.

Example:

```json
{
  "type": "isLocked",
  "value": true
}
```

##### isOpen

Checks if an issue or pull request is open or closed.

Example:

```json
{
  "type": "isOpen",
  "value": true
}
```

##### titleMatches

Checks if an issue or pull request's title matches a Regex pattern.

Example:

```json
{
  "type": "titleMatches",
  "pattern": "/^wip:/i"
}
```
  
#### Pull Request Conditions

##### branchMatches

Checks if branch name matches a Regex pattern.

Example:

```json
{
  "type": "branchMatches",
  "pattern": "^bugfix\\/"
}
```

##### changesSize

Checks if an pull request's changes against `min` & `max` values. Note: if `max` is `undefined` assumed value is `unlimited`

Example:

```json
{
  "type": "changesSize",
  "min": 0,
  "max": 100
}
```

##### filesMatch

Checks if the files modified in the pull request match a glob.

Globs are matched using the [minimatch](https://github.com/isaacs/minimatch) library.

Example:

```json
{
  "type": "filesMatch",
  "glob": "src/foo/**/*"
}
```

##### isApproved

Checks if a pull request has requested a review.

Example:

```json
{
  "type": "isApproved",
  "value": true,
  "required": 1
}
```

##### isDraft

Checks if a pull request is a draft.

Example:

```json
{
  "type": "isDraft",
  "value": true
}
```

##### pendingReview

Checks if a pull request has requested a review.

Example:

```json
{
  "type": "pendingReview",
  "value": true
}
```

##### requestedChanges

Checks if a pull request has requested a review.

Example:

```json
{
  "type": "requestedChanges",
  "value": true
}
```

#### Issue Conditions

## Final Note

Thank you for taking the time to look through this repository. If you have liked what you have found, please would you favourite & share. Ideally I would like to get a community behind this project which can ensure that it is maintained, updated and improved as GitActions get more suffisticated.

This project took heavy infulence from [IvanFon/super-labeler-action](https://github.com/IvanFon/super-labeler-action) which we are actively maintaining on our fork here: [Videndum/forked-super-labeler-action](https://github.com/Videndum/forked-super-labeler-action). We invite any of the team who worked on his project to come onboard with our version and intend to continue maintaining for a significant while.
