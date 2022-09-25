---
id: "Config"
title: "Interface: Config"
sidebar_label: "Config"
sidebar_position: 0
custom_edit_url: null
---

## Properties

### branch

• `Optional` **branch**: `string`

The branch used to get the config file from. Defaults to master.

#### Defined in

[src/action.ts:53](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L53)

___

### issue

• `Optional` **issue**: [`IssueConfig`](IssueConfig.md)

The issue configurations.

#### Defined in

[src/action.ts:94](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L94)

___

### labels

• `Optional` `Private` **labels**: `Object`

The labels used by our internal tools.

#### Index signature

▪ [key: `string`]: `string`

#### Defined in

[src/action.ts:80](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L80)

___

### pr

• `Optional` **pr**: [`PullRequestConfig`](PullRequestConfig.md)

The pull request configurations.

#### Defined in

[src/action.ts:90](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L90)

___

### project

• `Optional` **project**: [`ProjectConfig`](ProjectConfig.md)

The project configurations.

#### Defined in

[src/action.ts:98](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L98)

___

### retryLimit

• `Optional` **retryLimit**: `number`

Maximum number of attempts before stopping.

**`Default`**

3

#### Defined in

[src/action.ts:75](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L75)

___

### schedule

• `Optional` **schedule**: [`SharedConfig`](SharedConfig.md)

The schedule configurations.

#### Defined in

[src/action.ts:102](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L102)

___

### sharedConfig

• `Optional` **sharedConfig**: [`SharedConfig`](SharedConfig.md)

Shared configurations, merged with the PR, Issue, Project and Schedule configurations.

#### Defined in

[src/action.ts:86](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L86)

___

### versioning

• `Optional` **versioning**: `Object`

Versioning configuration used for release management.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `prereleaseName?` | `string` | If version is a pre-release, this is the version name to use. |
| `source` | `string` | Version source used to determine the version. |
| `type?` | ``"SemVer"`` | Version Type to change how versioning is handled. |

#### Defined in

[src/action.ts:57](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L57)
