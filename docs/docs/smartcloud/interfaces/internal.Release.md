---
id: "internal.Release"
title: "Interface: Release"
sidebar_label: "Release"
custom_edit_url: null
---

[internal](../modules/internal.md).Release

The release configuration

## Hierarchy

- [`PRConditionConfig`](PRConditionConfig.md)

  ↳ **`Release`**

## Properties

### condition

• **condition**: [`PRCondition`](../#prcondition)[]

The conditions required for this to succeed

#### Inherited from

[PRConditionConfig](PRConditionConfig.md).[condition](PRConditionConfig.md#condition)

#### Defined in

<<<<<<< HEAD
[src/conditions/index.ts:196](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/conditions/index.ts#L196)
=======
[src/conditions/index.ts:196](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/conditions/index.ts#L196)
>>>>>>> f1c3d7350ef9f5604f99e801f5604678ab957960

___

### createChangelog

• `Optional` **createChangelog**: [`Changelog`](internal.Changelog.md)

Should the release create a changelog?

#### Defined in

<<<<<<< HEAD
[src/contexts/methods/release.ts:59](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/release.ts#L59)
=======
[src/contexts/methods/release.ts:59](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/release.ts#L59)
>>>>>>> f1c3d7350ef9f5604f99e801f5604678ab957960

___

### createMilestone

• `Optional` **createMilestone**: [`CreateMilestone`](internal.CreateMilestone.md)

Should the release create the next milestone?

#### Defined in

<<<<<<< HEAD
[src/contexts/methods/release.ts:51](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/release.ts#L51)
=======
[src/contexts/methods/release.ts:51](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/release.ts#L51)
>>>>>>> f1c3d7350ef9f5604f99e801f5604678ab957960

___

### createPackages

• `Optional` **createPackages**: `string` \| `string`[]

Should the release create a Github Package?

#### Defined in

<<<<<<< HEAD
[src/contexts/methods/release.ts:55](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/release.ts#L55)
=======
[src/contexts/methods/release.ts:55](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/release.ts#L55)
>>>>>>> f1c3d7350ef9f5604f99e801f5604678ab957960

___

### createRelease

• `Optional` **createRelease**: [`CreateRelease`](internal.CreateRelease.md)

Should the release create a Github Release?

#### Defined in

<<<<<<< HEAD
[src/contexts/methods/release.ts:47](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/release.ts#L47)
=======
[src/contexts/methods/release.ts:47](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/release.ts#L47)
>>>>>>> f1c3d7350ef9f5604f99e801f5604678ab957960

___

### createTag

• `Optional` **createTag**: `boolean`

Should the release create a tag?

#### Defined in

<<<<<<< HEAD
[src/contexts/methods/release.ts:43](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/release.ts#L43)
=======
[src/contexts/methods/release.ts:43](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/release.ts#L43)
>>>>>>> f1c3d7350ef9f5604f99e801f5604678ab957960

___

### labels

• `Optional` **labels**: `Object`

The labels to use to detect release type (semantic release)

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `breaking?` | `string` | The label to use to mark a breaking change |
| `build` | `string` | The label to use to mark a build |
| `major` | `string` | The label to use to mark a major |
| `minor` | `string` | The label to use to mark a minor |
| `patch` | `string` | The label to use to mark a patch |
| `prerelease` | `string` | The label to use to mark a prerelease |

#### Defined in

<<<<<<< HEAD
[src/contexts/methods/release.ts:13](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/release.ts#L13)
=======
[src/contexts/methods/release.ts:13](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/release.ts#L13)
>>>>>>> f1c3d7350ef9f5604f99e801f5604678ab957960

___

### requires

• **requires**: `number`

The number of requires needed for this to succeed

#### Inherited from

[PRConditionConfig](PRConditionConfig.md).[requires](PRConditionConfig.md#requires)

#### Defined in

<<<<<<< HEAD
[src/conditions/index.ts:192](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/conditions/index.ts#L192)
=======
[src/conditions/index.ts:192](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/conditions/index.ts#L192)
>>>>>>> f1c3d7350ef9f5604f99e801f5604678ab957960
