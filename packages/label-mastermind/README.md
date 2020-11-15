# Label Mastermind

The super-powered labeler for Github Actions, with complex customisable conditions for PR, Issues and Projects.

## Capabilities

Label Mastermind is capable of the following:

- Create, Update, Delete Labels declaratively from Config file or JSON String
- Apply Labels based on conditions:
  - Pull Releases
  - Issues
  - Project Cards
- List of Conditions:
  - [creatorMatches](#creatormatches)
  - [descriptionMatches](#descriptionmatches)
  - [isLocked](#islocked)
  - [isOpen](#isopen)
  - [titleMatches](#titlematches)
  - [changesSize](#changessize)
  - [branchMatches](#branchmatches)
  - [filesMatch](#filesmatch)
  - [isDraft](#isdraft)
  - [pendingReview](#pendingreview)
  - [isApproved](#isapproved)
  - [requestedChanges](#requestedchanges)

Label Mastermind is designed to work in combination with other Videndum Studios Projects. Check out our [Universal Workflows Project](https://github.com/Videndum/Universal-GitAction-Workflows)

## Getting Started

<details>
  <summary><b>Click to show automatic configuration</b></summary>

The quickest way to get started with Label Mastermind is through our [Universal Workflows Project](https://github.com/Videndum/Universal-GitAction-Workflows)'s automatic installer.

**THIS IS UNDER CONSTRUCTION. PLEASE USE MANUAL CONFIGURATION**

</details>

<details>
  <summary><b>Click to show manual configuration</b></summary>
Create a new Github Actions workflow at `.github/workflows/label.yml`:

_Note: `actions/checkout` must be run first so that the labeler action can find your config file._

```yaml
on:
  issues: [opened, edited, closed, reopened]
  pull_request:
    types: [opened, edited, closed, reopened, ready_for_review, synchronize]

jobs:
  label:
    runs-on: ubuntu-latest
    name: Label issues and pull requests
    steps:
      - uses: actions/checkout@v2
      - uses: Videndum/label-mastermind@latest
        with:
          github-token: '${{ secrets.GITHUB_TOKEN }}'
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

Be sure that Github Actions is enabled for in your repository's settings. Label Mastermind will now run on your issues and pull requests.

</details>

## Index

- [Label Mastermind](#label-mastermind)
  - [Capabilities](#capabilities)
  - [Getting Started](#getting-started)
  - [Index](#index)
  - [How it Works](#how-it-works)
  - [Config File Format](#config-file-format)
  - [Using Regex Patterns](#using-regex-patterns)
  - [Available Conditions](#available-conditions)
    - [Common Conditions](#common-conditions)
      - [creatorMatches](#creatormatches)
      - [descriptionMatches](#descriptionmatches)
      - [isLocked](#islocked)
      - [isOpen](#isopen)
      - [titleMatches](#titlematches)
    - [Pull Request Conditions](#pull-request-conditions)
      - [changesSize](#changessize)
      - [branchMatches](#branchmatches)
      - [filesMatch](#filesmatch)
      - [isDraft](#isdraft)
      - [pendingReview](#pendingreview)
      - [isApproved](#isapproved)
      - [requestedChanges](#requestedchanges)
    - [Issue Conditions](#issue-conditions)
  - [Running Locally](#running-locally)
  - [Credit](#credit)

## How it Works

Whenever Label Mastermind runs, it will first add and update your repository's labels to match your config. Then it will go through each label's conditions to determine if it should apply or remove that label.

Each label has a list of conditions that must be met for it to be applied. You must specify the minimum number of conditions that must be met for the label to be applied.

Each label has a key, which can be different from it's name. This key should be in plaintext, and will be used to refer to the given label when defining your conditions. For example, given the following labels definition:

```json
{
  "labels": {
    "bugfix": {
      "name": "Bugfix! 🎉",
      "colour": "ff0000",
      "description": "Fixes a bug."
    }
  }
}
```

While the label's name, which will be displayed on Github, is "Bugfix! 🎉", to be able to easily refer to it from our conditions, we would use it's key, which is just `bugfix`:

```json
{
  "pr": {
    "bugfix": {
      "requires": 1,
      "conditions": [
        {
          "type": "branchMatches",
          "pattern": "^bugfix"
        }
      ]
    }
  }
}
```

## Config File Format

The config object contains three keys:

- `labels`: Your repository's labels, which will be automatically created and updated by Label Mastermind
- `issue`: Labels to apply to issues, and their conditions
- `pr`: Labels to apply to pull requests, and their conditions

Take a look at the examples in this file to get a feel for how to configure it. The below Typescript interface, which is used by this action, may also be helpful:

<details>
  <summary><b>Click to show Typescript config interface</b></summary>

```ts
interface Config {
  labels: {
    [key: string]: {
      name: string
      colour: string
      description: string
    }
  }
  issue: {
    [key: string]: {
      requires: number
      conditions: IssueCondition[]
    }
  }
  pr: {
    [key: string]: {
      requires: number
      conditions: PRCondition[]
    }
  }
  skip_labeling: string
  delete_labels: boolean
}
```

</details>

## Using Regex Patterns

Many conditions use regular expressions (usually with a `pattern` parameter).
Since these regular expressions are passed in through JSON strings, there are
some things to pay attention to.

Special characters must be double escaped: `pattern: "\\W+$"` is equivalent to the Regex: `/\W+$/`.

If you want to use flags, use the following format: `pattern: "/^wip:/i"` is equivalent to the Regex: `/^wip:/i`.

## Available Conditions

<details>
<summary><b>Common Conditions</b></summary>

### Common Conditions

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

#### titleMatches

Checks if an issue or pull request's title matches a Regex pattern.

Example:

```json
{
  "type": "titleMatches",
  "pattern": "/^wip:/i"
}
```

</details>

<details>
<summary><b>Pull Request Conditions</b></summary>
  
### Pull Request Conditions

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

#### branchMatches

Checks if branch name matches a Regex pattern.

Example:

```json
{
  "type": "branchMatches",
  "pattern": "^bugfix\\/"
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

#### requestedChanges

Checks if a pull request has requested a review.

Example:

```json
{
  "type": "requestedChanges",
  "value": true
}
```

</details>

<details>
<summary><b>Issue Conditions</b></summary>

### Issue Conditions

</details>

## Running Locally

Setting up local running is simple, however we **MUST** warn that building / packaging while using local scripts can cause your GITHUB_TOKEN to be included within the package. To avoid this happening please follow the steps correctly

1. Setup a secret on your repository named: `ACTIONS_STEP_DEBUG` value: `true`
2. Ensure the action after you created this secret
3. Clone this repository
4. Run `yarn install` or `npm install`
5. From the action logs find `Context for local running` copy the output into a file named `./context.json` at the root of the project.
6. Modify the `./config.sample.json` to contain your `GITHUB_TOKEN` and rename to `./config.json`
7. Run the script using `yarn run`
8. (Optional) For developing, make changes, then rebuild using `yarn build` or `yarn dev:run`
9. (Optional) If pushing changes to Github
   - Delete `./context.json`, `./config`, `./lib`, `./dist`.
   - Run `yarn dev:all`.

## Credit

This was originally conceptualised over on [IvanFon/super-labeler-action](https://github.com/IvanFon/super-labeler-action), unfortunately he stopped maintaining it. The original idea credit goes to IvanFon. We Invite him and the other contributors to join this project whenever they feel ready to return.

---

[back to top](#super-labeler-action)
