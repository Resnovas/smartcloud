# TGTGamer/.github

Welcome to my .github repository. This repository is where I develop all my workflows & templates used within all my organisations repositories. This repository is a collection of work from a range of people. I have done my best to document all the actions used [here](). If you discover an action missing from that list, please let me know or create a PR to update it.

<!-- toc -->
<!-- tocstop -->

## Workflow Status

![Documentation](https://github.com/TGTGamer/.github/workflows/Documentation/badge.svg)
![Release Management](https://github.com/TGTGamer/.github/workflows/Release%20Management/badge.svg)
![Project Management](https://github.com/TGTGamer/.github/workflows/Project%20Management/badge.svg)
![Pull Request Management](https://github.com/TGTGamer/.github/workflows/Pull%20Request%20Management/badge.svg)
![Issue Management](https://github.com/TGTGamer/.github/workflows/Issue%20Management/badge.svg)
![Changelog Auto-Generation](https://github.com/TGTGamer/.github/workflows/Changelog%20Auto-Generation/badge.svg)

## Workflows (Git Actions)

Github Actions, otherwise known as workflows are a way of automating activities within repositories on github. We at @videndum use them to automate tasks which are otherwise tedious and unplessant to preform. Each one of the workflows have been hand picked and delecately configured to work exactly as intended with one another, and the repository.

This repository is intended to be shared, collabrated, and improved over time, and I hope that you find it a sufficient starting point for all your projects.

### Prerequisite

To use this collection, you need to ensure that you have the following branches

- `docs/auto-update` - Used for all automatic updates except changelog
- `chore/changelog` - Used for automatic changelog creation

### My workflow

Ordered by developer intended use

1. User creates issue
   1. Automatically gets labeled based on title & body - [How to title your requests]()
   1. [Needs: a] Branch Automatically gets generated
   1. [Needs: a] Automatically gets assigned to project board
1. Branch is worked on by contributor
1. Contributor uses commands to move project in boards using [commands]() which trigger labels
1. Contributor creates pull request
   1. Automatically gets labeled based on if `WIP:` is prefixed
   1. Automatically gets labeled based on branch path
   1. Automatically gets labeled based on pull request size
   1. Automatically gets labeled based on changed file paths
   1. Automatically checks for conflicts with `Master` and `Pull Requests`
   1. Automatically ensures the `CLA` has been signed
1. Pull Request gets merged to master
   1. Automatically invites user to team `Community`
   1. Automatically creates & updates changelog.md
   1. Automatically creates & updates github release
   1. Automatically checks for updates to documentation (synced both directions)
      1. Copies & renames files
         - cp README.md -> docs/README.md (Used in gitbook)
         - cp README.md -> docs/Home.md (Used in {{repo}}.wiki)
         - cp docs/SUMMARY.md -> docs/\_Sidebar.md (Used in {{repo}}.wiki)
         - cp CHANGELOG.md -> docs/information/changelog.md
      1. Automatically pushes to {{repo}}.wiki.git (Used in {{repo}}.wiki)
      1. Automatically pushes to {{repo}}\_wiki.git (Used in gitbook)
