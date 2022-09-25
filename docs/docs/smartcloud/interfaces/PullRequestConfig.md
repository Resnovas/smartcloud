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

• `Optional` **assignProject**: [`AssignProject`](internal.AssignProject.md)[]

The project assignment configuration.

#### Defined in

[src/contexts/pullRequests.ts:24](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/pullRequests.ts#L24)

___

### automaticApprove

• `Optional` **automaticApprove**: [`AutomaticApprove`](internal.AutomaticApprove.md)

The automatic approval configuration

#### Defined in

[src/contexts/pullRequests.ts:28](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/pullRequests.ts#L28)

___

### enforceConventions

• `Optional` **enforceConventions**: [`EnforceConventions`](internal.EnforceConventions.md)

The enforceConventions configuration

#### Inherited from

[SharedConfig](SharedConfig.md).[enforceConventions](SharedConfig.md#enforceconventions)

#### Defined in

[src/action.ts:126](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L126)

___

### labels

• `Optional` **labels**: `Object`

The labels to be applied

#### Index signature

▪ [key: `string`]: [`IssueConditionConfig`](IssueConditionConfig.md) \| [`ProjectConditionConfig`](ProjectConditionConfig.md) \| [`PRConditionConfig`](PRConditionConfig.md) \| [`ScheduleConditionConfig`](ScheduleConditionConfig.md) \| [`SharedConditions`](SharedConditions.md)

#### Inherited from

[SharedConfig](SharedConfig.md).[labels](SharedConfig.md#labels)

#### Defined in

[src/action.ts:134](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L134)

___

### manageRelease

• `Optional` **manageRelease**: [`Release`](internal.Release.md)

The release management configuration.

#### Defined in

[src/contexts/pullRequests.ts:32](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/pullRequests.ts#L32)

___

### ref

• `Optional` **ref**: `string`

The reference used internally

#### Inherited from

[SharedConfig](SharedConfig.md).[ref](SharedConfig.md#ref)

#### Defined in

[src/action.ts:122](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L122)

___

### requestApprovals

• `Optional` **requestApprovals**: [`RequestApprovals`](internal.RequestApprovals.md)

Request approvals configuration.

#### Defined in

[src/contexts/pullRequests.ts:40](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/pullRequests.ts#L40)

___

### stale

• `Optional` **stale**: [`Stale`](internal.Stale.md)

The stale configuration

#### Inherited from

[SharedConfig](SharedConfig.md).[stale](SharedConfig.md#stale)

#### Defined in

[src/action.ts:130](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L130)

___

### syncRemote

• `Optional` **syncRemote**: [`SyncRemote`](internal.SyncRemote.md)[]

Syncronise remote repository configuration.

#### Defined in

[src/contexts/pullRequests.ts:36](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/pullRequests.ts#L36)
