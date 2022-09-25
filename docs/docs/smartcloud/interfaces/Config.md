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

<<<<<<< HEAD
[src/action.ts:53](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L53)
=======
[src/action.ts:48](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/action.ts#L48)
>>>>>>> f1c3d7350ef9f5604f99e801f5604678ab957960

___

### issue

• `Optional` **issue**: [`IssueConfig`](IssueConfig.md)

The issue configurations.

#### Defined in

<<<<<<< HEAD
[src/action.ts:94](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L94)
=======
[src/action.ts:89](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/action.ts#L89)
>>>>>>> f1c3d7350ef9f5604f99e801f5604678ab957960

___

### labels

• `Optional` `Private` **labels**: `Object`

The labels used by our internal tools.

#### Index signature

▪ [key: `string`]: `string`

#### Defined in

<<<<<<< HEAD
[src/action.ts:80](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L80)
=======
[src/action.ts:75](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/action.ts#L75)
>>>>>>> f1c3d7350ef9f5604f99e801f5604678ab957960

___

### pr

• `Optional` **pr**: [`PullRequestConfig`](PullRequestConfig.md)

The pull request configurations.

#### Defined in

<<<<<<< HEAD
[src/action.ts:90](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L90)
=======
[src/action.ts:85](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/action.ts#L85)
>>>>>>> f1c3d7350ef9f5604f99e801f5604678ab957960

___

### project

• `Optional` **project**: [`ProjectConfig`](ProjectConfig.md)

The project configurations.

#### Defined in

<<<<<<< HEAD
[src/action.ts:98](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L98)
=======
[src/action.ts:93](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/action.ts#L93)
>>>>>>> f1c3d7350ef9f5604f99e801f5604678ab957960

___

### retryLimit

• `Optional` **retryLimit**: `number`

Maximum number of attempts before stopping.

**`Default`**

3

#### Defined in

<<<<<<< HEAD
[src/action.ts:75](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L75)
=======
[src/action.ts:70](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/action.ts#L70)
>>>>>>> f1c3d7350ef9f5604f99e801f5604678ab957960

___

### schedule

• `Optional` **schedule**: [`SharedConfig`](SharedConfig.md)

The schedule configurations.

#### Defined in

<<<<<<< HEAD
[src/action.ts:102](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L102)
=======
[src/action.ts:97](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/action.ts#L97)
>>>>>>> f1c3d7350ef9f5604f99e801f5604678ab957960

___

### sharedConfig

• `Optional` **sharedConfig**: [`SharedConfig`](SharedConfig.md)

Shared configurations, merged with the PR, Issue, Project and Schedule configurations.

#### Defined in

<<<<<<< HEAD
[src/action.ts:86](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L86)
=======
[src/action.ts:81](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/action.ts#L81)
>>>>>>> f1c3d7350ef9f5604f99e801f5604678ab957960

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

<<<<<<< HEAD
[src/action.ts:57](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L57)
=======
[src/action.ts:52](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/action.ts#L52)
>>>>>>> f1c3d7350ef9f5604f99e801f5604678ab957960
