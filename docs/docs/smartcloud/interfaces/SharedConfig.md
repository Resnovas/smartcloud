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

[src/action.ts:126](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L126)

___

### labels

• `Optional` **labels**: `Object`

The labels to be applied

#### Index signature

▪ [key: `string`]: [`IssueConditionConfig`](IssueConditionConfig.md) \| [`ProjectConditionConfig`](ProjectConditionConfig.md) \| [`PRConditionConfig`](PRConditionConfig.md) \| [`ScheduleConditionConfig`](ScheduleConditionConfig.md) \| [`SharedConditions`](SharedConditions.md)

#### Defined in

[src/action.ts:134](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L134)

___

### ref

• `Optional` **ref**: `string`

The reference used internally

#### Defined in

[src/action.ts:122](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L122)

___

### stale

• `Optional` **stale**: [`Stale`](internal.Stale.md)

The stale configuration

#### Defined in

[src/action.ts:130](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L130)
