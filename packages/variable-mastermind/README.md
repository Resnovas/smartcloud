# Manage Github Secrets

This action is build to support the production of github workflow templates, and provide functionality to pass data from secrets or files to workflow steps. This therefore allows users to create complex workflows with complex enviormental variables.

We use secrets in this to reduce the load on the API as another method we tried would cause the api to max out regularly.

## Table of contents

- [Manage Github Secrets](#manage-github-secrets)
  - [Table of contents](#table-of-contents)
  - [Use this action](#use-this-action)
  - [Using Job Outputs](#using-job-outputs)
  - [Using Job Environment](#using-job-environment)

## Use this action

To get started with this action, create a file named `allconfig.json` or `allconfig.yml` and store your configuration variables within. For instance this is a valid file:

_[allconfig.json](.github/allconfigs.json)_

```json
{
  "auto": {
    // prefixed to the variables in this collection
    "enabled": true, // Should this section be used
    "vars": {
      // stores all the variables
      "branch": "auto-update"
    }
  }
}
```

_[allconfig.yml](.github/allconfigs.yml)_

```yaml
auto: # prefixed to the variables in this collection
  enabled: true # Should this section be used
  vars: # stores all the variables
    branch: 'auto-update'
```

Using the action within a workflow can require a small bit of configuration, depending on the application. The following exaples are created from our application [Universal GitActions Workflows](https://github.com/Videndum/Universal-GitAction-Workflows) which is heavily based on this action.

## Using Job Outputs

```yaml
jobs:
  getConfigs:
    runs-on: ubuntu-latest
    outputs:
      setting: ${{steps.tests.outputs.test_setting}}} # By setting which outputs you want to use here you can use them in other jobs
    steps:
      - name: Manage Github Secrets
        uses: Videndum/manage-github-secrets@1.0.0-beta
        with:
          settings: ${{ secrets.SETTINGS }} # The secret containing your JSON settings string
          settingsjson: '.github/allconfigs.json' # The file storing the settings (can be JSON or YML)
          mode: 'output' # The mode to output vars - Options: output, environment, secret
          token: ${{ secrets.GITHUB_TOKEN }} # Your github token to allow access to the API if needed (only used as backup when secret.SETTINGS isn't valid)

  test-output: # make sure the action works on a clean machine without building
    runs-on: ubuntu-latest
    needs: getConfigs
    steps:
      - name: check output
        run: |
          echo "${{needs.getConfigs.outputs.setting}}"
```

## Using Job Environment

```yaml
jobs:
  getConfigs:
    runs-on: ubuntu-latest
    steps:
      - name: Manage Github Secrets
        uses: Videndum/manage-github-secrets@1.0.0-beta
        with:
          settings: ${{ secrets.SETTINGS }} # The secret containing your JSON settings string
          settingsjson: '.github/allconfigs.json' # The file storing the settings (can be JSON or YML)
          mode: 'environment' # The mode to output vars - Options: output, environment, secret
          token: ${{ secrets.GITHUB_TOKEN }} # Your github token to allow access to the API if needed (only used as backup when secret.SETTINGS isn't valid)
      - name: check env
        run: echo "${{env.test_setting}}"
```
