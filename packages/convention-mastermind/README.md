# Convention Collection

The super-powered convention enforment for Github Actions, with complex customisable conditions for PR, Issues and Projects.

## Index

<!-- toc -->

- [How to get support 👨‍👩‍👧‍👦](#how-to-get-support-%F0%9F%91%A8%E2%80%8D%F0%9F%91%A9%E2%80%8D%F0%9F%91%A7%E2%80%8D%F0%9F%91%A6)
  - [Why not GitHub Issues?](#why-not-github-issues)
- [Backlog & Contributing](#backlog--contributing)
- [Running Locally & Developing](#running-locally--developing)
  - [Prerequisities](#prerequisities)
  - [Developing](#developing)
  - [Running locally](#running-locally)
- [Getting Started](#getting-started)
  - [Automatic setup via CLI](#automatic-setup-via-cli)
  - [Manual setup](#manual-setup)
  - [All configuration options](#all-configuration-options)
    - [Runners](#runners)
    - [IssueConfig](#issueconfig)
    - [ProjectConfig](#projectconfig)
    - [PullRequestConfig](#pullrequestconfig)
    - [PullRequestConfig](#pullrequestconfig-1)
      - [EnforceConventions](#enforceconventions)
      - [SharedConventionsConfig](#sharedconventionsconfig)
    - [Typings](#typings)
  - [Using Regex Patterns](#using-regex-patterns)
- [Available Conditions](#available-conditions)
  - [Common Conditions](#common-conditions)
    - [\$and](#and)
    - [creatorMatches](#creatormatches)
    - [descriptionMatches](#descriptionmatches)
    - [hasLabel](#haslabel)
    - [isLocked](#islocked)
    - [isOpen](#isopen)
    - [\$only](#only)
    - [\$or](#or)
  - [Pull Request Conditions](#pull-request-conditions)
    - [branchMatches](#branchmatches)
    - [changesSize](#changessize)
    - [filesMatch](#filesmatch)
    - [isApproved](#isapproved)
    - [isDraft](#isdraft)
    - [pendingReview](#pendingreview)
    - [requestedChanges](#requestedchanges)
  - [Issue Conditions](#issue-conditions)
  - [Project Conditions](#project-conditions)
    - [onColumn](#oncolumn)
- [Final Note](#final-note)

<!-- tocstop -->

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
    <summary><b>Our runners config</b></summary>

```json
[
  {
    "root": ".",
    "projectType": "node",
    "versioning": "SemVer",
    "prereleaseName": "alpha",
    "pr": {
      "enforceConventions": {
        "conventions": [
          {
            "requires": 1,
            "contexts": [
              "workflow",
              "release",
              "label",
              "variable",
              "installer",
              "deps",
              "deps-dev"
            ],
            "conditions": "semanticTitle"
          }
        ]
      }
    },
    "issue": {
      "ref": "develop",
      "enforceConventions": {
        "conventions": [
          {
            "requires": 1,
            "contexts": [
              "workflow",
              "release",
              "label",
              "variable",
              "installer",
              "deps",
              "deps-dev"
            ],
            "conditions": "semanticTitle"
          }
        ]
      }
    },
    "project": {
      "ref": "develop",
      "enforceConventions": {
        "onColumn": ["Accepted", "Reviewing"],
        "conventions": [
          {
            "requires": 1,
            "contexts": [
              "workflow",
              "release",
              "label",
              "variable",
              "installer",
              "deps",
              "deps-dev"
            ],
            "conditions": "semanticTitle"
          }
        ]
      }
    }
  }
]
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
| projectType        | true     | Defines the type of project                 | `"node" / "other"`                        |
| versioning         | false    | Defines the versioning of the project       | `"SemVer" / "other"`                      |
| prereleaseName     | false    | Defines the name of a prerelease            | `string`                                  |
| sharedLabelsConfig | false    | Defines labels to use on both PR and Issues | [`SharedLabels`](#sharedlabels)           |
| pr                 | false    | Defines the configuration for Pull Requests | [`PullRequestConfig`](#pullrequestconfig) |
| issue              | false    | Defines the configuration for issues        | [`IssueConfig`](#issueconfig)             |
| project            | false    | Defines the configuration for projects      | [`ProjectConfig`](#projectconfig)         |

#### IssueConfig

| Option             | Required | Description             | Params                                      |
| ------------------ | -------- | ----------------------- | ------------------------------------------- |
| ref                | false    | Overrides the reference | `string`                                    |
| enforceConventions | false    | Enforces conventions    | [`EnforceConventions`](#enforceconventions) |

#### ProjectConfig

| Option             | Required | Description             | Params                                      |
| ------------------ | -------- | ----------------------- | ------------------------------------------- |
| ref                | false    | Overrides the reference | `string`                                    |
| enforceConventions | false    | Enforces conventions    | [`EnforceConventions`](#enforceconventions) |

#### PullRequestConfig

| Option             | Required | Description             | Params                                      |
| ------------------ | -------- | ----------------------- | ------------------------------------------- |
| ref                | false    | Overrides the reference | `string`                                    |
| enforceConventions | false    | Enforces conventions    | [`EnforceConventions`](#enforceconventions) |

#### PullRequestConfig

| Option             | Required | Description             | Params                                      |
| ------------------ | -------- | ----------------------- | ------------------------------------------- |
| ref                | false    | Overrides the reference | `string`                                    |
| enforceConventions | false    | Enforces conventions    | [`EnforceConventions`](#enforceconventions) |

##### EnforceConventions

| Option        | Required | Description                                                             | Params                                                  |
| ------------- | -------- | ----------------------------------------------------------------------- | ------------------------------------------------------- |
| onColumn      | false    | (if project card ) Which column should trigger this action              | `column[ String / Number ]`                             |
| commentHeader | false    | A comment to append to the header of failed comments                    | `string`                                                |
| commentFooter | false    | A comment to append to the footer of failed comments                    | `string`                                                |
| moveToColumn  | false    | (if project card) Optionally move the card to another column on failure | `String / Number`                                       |
| Conventions   | true     | The conventions to enforce                                              | [`SharedConventionsConfig[]`](#sharedconventionsconfig) |

##### SharedConventionsConfig

| Option        | Required | Description                                           | Params                          |
| ------------- | -------- | ----------------------------------------------------- | ------------------------------- |
| requires      | true     | The number of conditions this requires                | `number`                        |
| failedComment | true     | A comment to respond with should this convention fail | `string`                        |
| conditions    | true     | The conditions to check against                       | `Condition[] / "semanticTitle"` |
| contexts      | false    | (if using `"semanticTitle"`) contexts to use          | `string[]`                      |

Choosing `"semanticTitle"` as the condition will automatically configure your conventions to use semantic conventions. You can add additional context by adding the `contexts` option which enforce only those contexts get used.

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
export interface IssueConfig extends SharedConfig {}
export interface PullRequestConfig extends SharedConfig {}
export interface ProjectConfig extends SharedConfig {}

interface SharedConfig {
  ref?: string
  enforceConventions?: EnforceConventions
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

interface EnforceConventions {
  onColumn?: Column[]
  commentHeader?: string
  commentFooter?: string
  moveToColumn?: string
  conventions: SharedConventionsConfig[]
}

export interface SharedConventionsConfig extends SharedConventionConditions {
  failedComment: string
  contexts?: string[]
}

interface SharedConventionConditions {
  requires: number
  conditions: Condition[] | string
}

export type ProjectType = 'node' | 'other'
export type VersionType = 'SemVer'
export type Column = string | number
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

#### \$and

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
    }
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

#### \$only

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
    }
  ]
}
```

#### \$or

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
    }
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

Checks if the card is in the specified column.

Example:

```json
{
  "type": "onColumn",
  "project": "Isuues",
  "column": "New"
}
```

## Final Note

Thank you for taking the time to look through this repository. If you have liked what you have found, please would you favourite & share. Ideally I would like to get a community behind this project which can ensure that it is maintained, updated and improved as GitActions get more suffisticated.

This project took heavy infulence from [IvanFon/super-labeler-action](https://github.com/IvanFon/super-labeler-action) which we are actively maintaining on our fork here: [Videndum/forked-super-labeler-action](https://github.com/Videndum/forked-super-labeler-action). We invite any of the team who worked on his project to come onboard with our version and intend to continue maintaining for a significant while.
