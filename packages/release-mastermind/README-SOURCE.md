# Mastermind Collection

Welcome to the Github Action Mastermind collection. This is the mono-repository for Videndum's collection of superpowered actions. This collection is built to work together as an univeral tool for Github Project management. For simplisity, our main tool - Release Mastermind - incorperates all our other tools within one simple action, which can be used in all your workflows to manage all your common tasks.

We designed this tool because the community tools either didn't have the features we wanted, or are not maintained. We wanted to create a single action which could do everything, or nothing, dependent on the configuration. This tool does exactly that, you choose how much or how little you want it to do...

Need reasons to consider using Release Manager?

- Everything is configured from either JSON or YAML files found within your `.github` folder for the repository. One file = no clutter.
- Automates all common tasks within a single action - Reduce the size of your workflow files
- Actively maintained - This project is actively maintained as it's the backbone of all our projects
- Works on any repository - No permissions required, simply use a Personal Access Token

## Index

<!-- toc -->

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
- <!-- #include docs/readme/components/support.md -->
  <!-- #include docs/readme/components/backlog.md -->
  <!-- #include docs/readme/components/runningLocally.md -->

## Getting Started

> [!IMPORTANT]
> It is **Extremely** important to understand while using this template, most of the code within `.github/` will automatically update within a new pull request whenever the [template repository](https://github.com/Videndum/Universal-GitAction-Workflows) is updated.

<!-- #include docs/readme/components/setup/automaticSetup.md -->

### Manual setup

Create a new Github Actions workflow at `.github/workflows/main.yml`:

_Note: `actions/checkout` must be run first so that the release action can find your config file._

<details>
    <summary><b>main.yml</b></summary>

<!-- #code .github/workflows/main.yml -->

</details>

Now create the config file at `.github/config.json`:

<details>
    <summary><b>Our runners config (Very Long)</b></summary>

<!-- #code .github/config/runners.json -->

</details>

Be sure that Github Actions is enabled for in your repository's settings. The action will now run on your issues, projects and pull requests.

<!-- #include docs/readme/components/workflowConfig.md -->
<!-- #include docs/readme/components/setup/releaseConfig.md -->

#### Typings

<details>
    <summary><b>Types</b></summary>

<!-- #code types/*.d.ts -->

</details>

<!-- #include docs/readme/components/regex.md -->
<!-- #include src/conditions/index.md -->

## Final Note

Thank you for taking the time to look through this repository. If you have liked what you have found, please would you favourite & share. Ideally I would like to get a community behind this project which can ensure that it is maintained, updated and improved as GitActions get more suffisticated.

This project took heavy infulence from [IvanFon/super-labeler-action](https://github.com/IvanFon/super-labeler-action) which we are actively maintaining on our fork here: [Videndum/label-mastermind](https://github.com/Videndum/label-mastermind). We invite any of the team who worked on his project to come onboard with our version and intend to continue maintaining for a significant while.
