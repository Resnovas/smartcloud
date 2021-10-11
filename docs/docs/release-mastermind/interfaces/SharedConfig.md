---
id: "SharedConfig"
title: "Interface: SharedConfig"
sidebar_label: "SharedConfig"
sidebar_position: 0
custom_edit_url: null
---

<!-- @format -->

The shared configuration

## Hierarchy

- **`SharedConfig`**

  ↳ [`IssueConfig`](IssueConfig.md)

  ↳ [`ProjectConfig`](ProjectConfig.md)

  ↳ [`PullRequestConfig`](PullRequestConfig.md)

## Properties

### enforceConventions

• `Optional` **enforceConventions**: `EnforceConventions`

    The enforceConventions configuration

#### Defined in

[action.ts:119](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L119)

---

### labels

• `Optional` **labels**: `Object`

The labels to be applied

#### Index signature

▪ [key: `string`]: [`IssueConditionConfig`](IssueConditionConfig.md) \| [`ProjectConditionConfig`](ProjectConditionConfig.md) \| [`PRConditionConfig`](PRConditionConfig.md) \| [`ScheduleConditionConfig`](ScheduleConditionConfig.md) \| [`SharedConditions`](SharedConditions.md)

#### Defined in

[action.ts:127](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L127)

---

### ref

• `Optional` **ref**: `string`

The reference used internally

#### Defined in

[action.ts:115](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L115)

---

### stale

• `Optional` **stale**: `Stale`

    The stale configuration

#### Defined in

[action.ts:123](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L123)
