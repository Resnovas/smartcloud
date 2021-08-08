---
id: "PullRequestConfig"
title: "Interface: PullRequestConfig"
sidebar_label: "PullRequestConfig"
sidebar_position: 0
custom_edit_url: null
---

The Pull Request configuration

## Hierarchy

- [`SharedConfig`](SharedConfig.md)

  ↳ **`PullRequestConfig`**

## Properties

### assignProject

• `Optional` **assignProject**: `AssignProject`[]

 The project assignment configuration.

#### Defined in

[contexts/pullRequests.ts:24](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/contexts/pullRequests.ts#L24)

___

### automaticApprove

• `Optional` **automaticApprove**: `AutomaticApprove`

The automatic approval configuration

#### Defined in

[contexts/pullRequests.ts:28](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/contexts/pullRequests.ts#L28)

___

### enforceConventions

• `Optional` **enforceConventions**: `EnforceConventions`

	The enforceConventions configuration

#### Inherited from

[SharedConfig](SharedConfig.md).[enforceConventions](SharedConfig.md#enforceconventions)

#### Defined in

[action.ts:119](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L119)

___

### labels

• `Optional` **labels**: `Object`

The labels to be applied

#### Index signature

▪ [key: `string`]: [`IssueConditionConfig`](IssueConditionConfig.md) \| [`ProjectConditionConfig`](ProjectConditionConfig.md) \| [`PRConditionConfig`](PRConditionConfig.md) \| [`ScheduleConditionConfig`](ScheduleConditionConfig.md) \| [`SharedConditions`](SharedConditions.md)

#### Inherited from

[SharedConfig](SharedConfig.md).[labels](SharedConfig.md#labels)

#### Defined in

[action.ts:127](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L127)

___

### manageRelease

• `Optional` **manageRelease**: `Release`

The release management configuration.

#### Defined in

[contexts/pullRequests.ts:32](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/contexts/pullRequests.ts#L32)

___

### ref

• `Optional` **ref**: `string`

The reference used internally

#### Inherited from

[SharedConfig](SharedConfig.md).[ref](SharedConfig.md#ref)

#### Defined in

[action.ts:115](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L115)

___

### stale

• `Optional` **stale**: `Stale`

	The stale configuration

#### Inherited from

[SharedConfig](SharedConfig.md).[stale](SharedConfig.md#stale)

#### Defined in

[action.ts:123](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L123)

___

### syncRemote

• `Optional` **syncRemote**: `SyncRemote`[]

Syncronise remote repository configuration.

#### Defined in

[contexts/pullRequests.ts:36](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/contexts/pullRequests.ts#L36)
