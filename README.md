<!-- @format -->

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-4-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

# Smartcloud

The most advanced github action, with functionality overflowing and declaritive configuration to streamline your entire github workflow!

## ProjectsV2 API -- Experimental

Projects Classic is still supported

I have began to work on the new ProjectsV2 api, which has required us to deploy an app which uses OAuth to interact with the new Projects API. This has not effected the functionality of the rest of the tools and is not required for most of the tools to function.

## Index

<!-- toc -->

- [Smartcloud](#smartcloud)
  - [ProjectsV2 API -- Experimental](#projectsv2-api----experimental)
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
  - [Final Note](#final-note)

<!-- tocstop -->

## Features

- Create, Update, Delete Labels declaratively from Config
- Apply Labels based on conditions
- Enforce Conventions - Ensure the repository follows conventions setout by your team. Configured using Conditions
- Automatically assign to projects - Ensure your projects have all open issues and pull requests assigned to the correct locations.
- Automatically assign to milestones - Keep milestones upto date by automatically assigning issues and pull requests
- Automatically create Branches - Open branches based on project column, or when an issue is opened.
- Automatically approve - Setup automatic pull request approval based on conditions.
- Automatically bump version - Automatically increase the version of your project - Optionally use tags.
- Automatically package and release - Specify commands to run when new release should be created.
- Create Changelogs - Automatically create changelogs for your project.
- Create milestones automatically - Automatically create milestones when a new release is published.

## How to get support 👨‍👩‍👧‍👦

For **Features Requests**, **Q&A**, **Show & Tell** and **Discussions** please use **[our discussions page](https://github.com/resnovas/smartcloud/discussions)** 🚑.

We have a **FAQ** category in our **[discussions page](https://github.com/resnovas/smartcloud/discussions)** where you can get quick answers, help with debugging weird issues, and general help.

Our extensive **documentation** can be found at **[here](https://github.com/resnovas/smartcloud/blob/develop/README.md)**.

### Why not GitHub Issues?

GitHub is our office, it's the place where our development and contributor teams do their work. We use the issue list to keep track of bugs and the features that we are working on. We do this openly for transparency, to reduce replication by contributors and increase productivity.

With the discussion page, you can leverage the knowledge of our wider community to get help with any problems you are having. Please keep in mind that this project is open-source, support is provided by the goodwill of our wonderful community members.

## Backlog & Contributing

For more information on how to contribute, please read the [contributing guidelines](docs/contributing/README.md).

Our backlog can be found on [Github](https://github.com/resnovas/smartcloud/projects/1)

## Running Locally & Developing

Setting up local running is simple, however we **MUST** warn that building / packaging while using local scripts can cause your GITHUB_TOKEN to be included within the package. To avoid this happening. you **MUST** follow the steps correctly. We will not be held responsible for any leeked personal tokens.

### Prerequisities

1. Setup a secret on your repository named: `ACTIONS_STEP_DEBUG` value: `true`
2. Ensure the action has run once after you created this secret

### Developing

3. Fork & Clone the [development repository](https://github.com/resnovas/smartcloud)
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
> It is **Extremely** important to understand while using this template, most of the code within `.github/` will automatically update within a new pull request whenever the [template repository](https://github.com/resnovas/Universal-GitAction-Workflows) is updated.

### Automatic setup via CLI

[coming soon]

### Manual setup

Create a new Github Actions workflow at `.github/workflows/main.yml`:

_Note: `actions/checkout` must be run first so that the release action can find your config file._

<details>
    <summary><b>main.yml</b></summary>

```yaml
# @format

name: Project Management
on:
  issues:
    types: [opened, edited, closed, reopened]
  pull_request:
    types: [opened, edited, closed, reopened, synchronize]
  project_card:
    types: [created, moved, deleted]
  schedule: [cron: "0 * * * *"]

jobs:
  release-mastermind:
    name: Release Mastermind
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2.3.4
      - uses: ./
        with:
          GITHUB_TOKEN: "${{ secrets.BOT_TOKEN }}"
          config: .github/allconfigs.json
```

</details>

Now create the config file at `.github/config.json`.

## Final Note

Thank you for taking the time to look through this repository. If you have liked what you have found, please would you favourite & share. Ideally I would like to get a community behind this project which can ensure that it is maintained, updated and improved as GitActions get more suffisticated.

This project took heavy infulence from [IvanFon/super-labeler-action](https://github.com/IvanFon/super-labeler-action) which we were maintaining on our fork here: [resnovas/label-mastermind](https://github.com/resnovas/label-mastermind). We invite any of the team who worked on his project to come onboard.

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center"><a href="https://github.com/IvanFon"><img src="https://avatars.githubusercontent.com/u/1174413?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ivan</b></sub></a><br /><a href="https://github.com/Resnovas/smartcloud/issues?q=author%3AIvanFon" title="Bug reports">🐛</a> <a href="https://github.com/Resnovas/smartcloud/commits?author=IvanFon" title="Code">💻</a> <a href="#ideas-IvanFon" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/Resnovas/smartcloud/commits?author=IvanFon" title="Documentation">📖</a> <a href="#infra-IvanFon" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-IvanFon" title="Maintenance">🚧</a> <a href="#projectManagement-IvanFon" title="Project Management">📆</a> <a href="https://github.com/Resnovas/smartcloud/commits?author=IvanFon" title="Tests">⚠️</a> <a href="#tool-IvanFon" title="Tools">🔧</a></td>
      <td align="center"><a href="https://keybase.io/TGTGamer"><img src="https://avatars.githubusercontent.com/u/11413796?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jonathan S</b></sub></a><br /><a href="#question-TGTGamer" title="Answering Questions">💬</a> <a href="https://github.com/Resnovas/smartcloud/issues?q=author%3ATGTGamer" title="Bug reports">🐛</a> <a href="https://github.com/Resnovas/smartcloud/commits?author=TGTGamer" title="Code">💻</a> <a href="#design-TGTGamer" title="Design">🎨</a> <a href="https://github.com/Resnovas/smartcloud/commits?author=TGTGamer" title="Documentation">📖</a> <a href="#example-TGTGamer" title="Examples">💡</a> <a href="#ideas-TGTGamer" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-TGTGamer" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-TGTGamer" title="Maintenance">🚧</a> <a href="#projectManagement-TGTGamer" title="Project Management">📆</a> <a href="#security-TGTGamer" title="Security">🛡️</a> <a href="https://github.com/Resnovas/smartcloud/commits?author=TGTGamer" title="Tests">⚠️</a> <a href="#tool-TGTGamer" title="Tools">🔧</a></td>
      <td align="center"><a href="https://github.com/jbinda"><img src="https://avatars.githubusercontent.com/u/21242757?v=4?s=100" width="100px;" alt=""/><br /><sub><b>jbinda</b></sub></a><br /><a href="https://github.com/Resnovas/smartcloud/commits?author=jbinda" title="Code">💻</a> <a href="#maintenance-jbinda" title="Maintenance">🚧</a></td>
      <td align="center"><a href="https://github.com/VidendumStudios"><img src="https://avatars.githubusercontent.com/u/68557851?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Videndum Studios Github Actions</b></sub></a><br /><a href="#projectManagement-VidendumStudios" title="Project Management">📆</a> <a href="#tool-VidendumStudios" title="Tools">🔧</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
