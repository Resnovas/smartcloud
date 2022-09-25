---
id: "ProjectConfig"
title: "Interface: ProjectConfig"
sidebar_label: "ProjectConfig"
sidebar_position: 0
custom_edit_url: null
---

The project configuration

## Hierarchy

- [`SharedConfig`](SharedConfig.md)

  ↳ **`ProjectConfig`**

## Properties

### assignMilestone

• `Optional` **assignMilestone**: `Object`

Assign to milestone configuration

#### Index signature

▪ [milestone: `string`]: [`Milestones`](internal.Milestones.md)

#### Defined in

[src/contexts/projects.ts:30](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/projects.ts#L30)

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

### openBranch

• `Optional` **openBranch**: [`ProjectCreateBranch`](internal.ProjectCreateBranch.md)

Open branch configuration

#### Defined in

[src/contexts/projects.ts:26](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/projects.ts#L26)

___

### ref

• `Optional` **ref**: `string`

The reference used internally

#### Inherited from

[SharedConfig](SharedConfig.md).[ref](SharedConfig.md#ref)

#### Defined in

[src/action.ts:122](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L122)

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

• `Optional` **syncRemote**: [`ExProjects`](internal.ExProjects.md)[]

Syncronise remote repository configuration.

#### Defined in

[src/contexts/projects.ts:22](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/projects.ts#L22)
