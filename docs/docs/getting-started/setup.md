<!-- @format -->

# Manual setup

Create a new Github Actions workflow at `.github/workflows/action.yml` which uses our action:

_Note: `actions/checkout` must be run first so that the release action can find your config file._

```yaml
name: Project Management
on:
  issues:
    types: [opened, edited, closed, reopened]
  pull_request_target:
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
      - name: Release Mastermind
        uses: Videndum/release-mastermind@0.0.0-alpha.7
        with:
          GITHUB_TOKEN: "${{ secrets.BOT_TOKEN }}"
          config: .github/allconfigs.json
```

Now create the config file at `.github/config.json`:

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

Be sure that Github Actions is enabled for in your repository's settings.

## How to configure?

We are working on a couple of automated ways to configure this action, and will be releasing them shortly (Fall 2021). In the mean time you can checkout our extensive documentation found on our [website](https://videndum.github.io/action-masterminds) and [our configuration page](../release-mastermind/interfaces/Config)
