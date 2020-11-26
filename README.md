# Mastermind Collection

Welcome to the Github Action Mastermind collection. This is the mono-repository for Videndum's collection of superpowered actions. This collection is built to work together as an univeral tool for Github Project management, 

- [Mastermind Collection](#mastermind-collection)
  - [Features](#features)
    - [Release Mastermind](#release-mastermind)
    - [Lable Mastermind](#lable-mastermind)
    - [Variable Mastermind](#variable-mastermind)
  - [Getting Started](#getting-started)
    - [Automatic setup (Using Repository Template)](#automatic-setup-using-repository-template)
    - [Automatic setup via CLI](#automatic-setup-via-cli)
    - [Manual setup](#manual-setup)
  - [Backlog & Contributing](#backlog--contributing)
  - [Final Note](#final-note)

## Features

### Release Mastermind

- Projects
  - Enforce conventions
  - Synchronise card movements with remote project board
  - Assign to milestone
  - Create branches
- Issues
  - Automatically assign to projects
  - Automatically move project card
  - Create branches
- Milestones
  - Create pull request on completion
- Pull Requests
  - Enforce conventions
  - Hotfix duplication
  - Automatically approve
  - Create releases
    - Create changelogs
    - Bump version
    - Create tags
    - Automatically create milestones
    - Create packages
  - Syncronise with remote repository

### Lable Mastermind

- Create, Update, Delete Labels declaratively from Config file or JSON String
- Apply Labels based on conditions:
  - Pull Releases
  - Issues
  - Project Cards
- List of Conditions:
  - [creatorMatches](packages/label-mastermind/README.md##available-conditions)
  - [descriptionMatches](packages/label-mastermind/README.md##available-conditions)
  - [isLocked](packages/label-mastermind/README.md##available-conditions)
  - [isOpen](packages/label-mastermind/README.md##available-conditions)
  - [titleMatches](packages/label-mastermind/README.md##available-conditions)
  - [changesSize](packages/label-mastermind/README.md##available-conditions)
  - [branchMatches](packages/label-mastermind/README.md##available-conditions)
  - [filesMatch](packages/label-mastermind/README.md##available-conditions)
  - [isDraft](packages/label-mastermind/README.md##available-conditions)
  - [pendingReview](packages/label-mastermind/README.md##available-conditions)
  - [isApproved](packages/label-mastermind/README.md##available-conditions)
  - [requestedChanges](packages/label-mastermind/README.md##available-conditions)

### Variable Mastermind

## Getting Started

> [!IMPORTANT]
> It is **Extremely** important to understand while using this template, most of the code within `.github/` will automatically update within a new pull request whenever the [template](https://github.com/Videndum/Universal-GitAction-Workflows) is updated.

### Automatic setup (Using Repository Template)

Setting up our actions shouldn't take long, it would defeat the purpose. Simplest way to get started is to click that `Use this template` button! Our template will automatically be built by Github, which will trigger our workflows which cleanup and setup everything for you.

[Use this template!](https://github.com/Videndum/workflow-mastermind/generate)

### Automatic setup via CLI

[coming soon]

### Manual setup

To manually get started with this template, please follow our [documentation](docs/getting-started/getting-started.md).

## Backlog & Contributing

Thank you for taking an interst in contributing. We have created development containers (`.devcontainer`) to allow you to jump straight in with coding. We even went through the hassle of setting up step by step guides using [CodeTour](https://github.com/vsls-contrib/codetour). Everything is configured and ready to go, all you need to do is use one of the supported platforms: [VSCode](https://code.visualstudio.com/docs/remote/remote-overview) | [Github Codespaces](https://github.com/features/codespaces)

For more information on how to contribute, please read the [contributing guidelines](docs/contributing/README.md).

Our backlog can be found on [Github](https://github.com/Videndum/action-masterminds/projects/1)

## Final Note

Thank you for taking the time to look through this repository. If you have liked what you have found, please would you favourite & share. Ideally I would like to get a community behind this project which can ensure that it is maintained, updated and improved as GitActions get more suffisticated.
