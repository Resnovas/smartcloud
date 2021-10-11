---
id: intro
title: Getting Started
sidebar_label: Intro
slug: "/getting-started"
---

<!-- @format -->

Welcome to the Github Action Mastermind collection. This is the mono-repository for Videndum's collection of superpowered actions. This collection is built to work together as an universal tool for Github Project management. For simplicity, our main tool - Release Mastermind - incorporates all our other tools within one simple action, which can be used in all your workflows to manage all your common tasks.

We designed this tool because the community tools either didn't have the features we wanted, or are not maintained. We wanted to create a single action which could do everything, or nothing, dependent on the configuration. This tool does exactly that, you choose how much or how little you want it to do...

Need reasons to consider using Release Manager?

- Everything is configured from either JSON or YAML files found within your `.github` folder for the repository. One file = no clutter.
- Automates all common tasks within a single action - Reduce the size of your workflow files
- Actively maintained - This project is actively maintained as it's the backbone of all our projects
- Works on any repository - No complex permission setups, simply use a Personal Access Token with access to the repository or the default `GITHUB_TOKEN`
