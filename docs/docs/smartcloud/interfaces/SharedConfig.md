---
id: "SharedConfig"
title: "Interface: SharedConfig"
sidebar_label: "SharedConfig"
sidebar_position: 0
custom_edit_url: null
---

The shared configuration

## Hierarchy

- **`SharedConfig`**

  ↳ [`IssueConfig`](IssueConfig.md)

  ↳ [`ProjectConfig`](ProjectConfig.md)

  ↳ [`PullRequestConfig`](PullRequestConfig.md)

## Properties

### enforceConventions

• `Optional` **enforceConventions**: [`EnforceConventions`](internal.EnforceConventions.md)

The enforceConventions configuration

#### Defined in

[src/action.ts:121](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/action.ts#L121)

___

### labels

• `Optional` **labels**: `Object`

The labels to be applied

#### Index signature

▪ [key: `string`]: [`IssueConditionConfig`](IssueConditionConfig.md) \| [`ProjectConditionConfig`](ProjectConditionConfig.md) \| [`PRConditionConfig`](PRConditionConfig.md) \| [`ScheduleConditionConfig`](ScheduleConditionConfig.md) \| [`SharedConditions`](SharedConditions.md)

#### Defined in

[src/action.ts:129](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/action.ts#L129)

___

### ref

• `Optional` **ref**: `string`

The reference used internally

#### Defined in

[src/action.ts:117](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/action.ts#L117)

___

### stale

• `Optional` **stale**: [`Stale`](internal.Stale.md)

The stale configuration

#### Defined in

[src/action.ts:125](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/action.ts#L125)
