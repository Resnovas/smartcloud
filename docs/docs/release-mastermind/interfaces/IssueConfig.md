---
id: "IssueConfig"
title: "Interface: IssueConfig"
sidebar_label: "IssueConfig"
sidebar_position: 0
custom_edit_url: null
---

The issue configuration

## Hierarchy

- [`SharedConfig`](SharedConfig.md)

  ↳ **`IssueConfig`**

## Properties

### assignProject

• `Optional` **assignProject**: `AssignProject`[]

Assign project configuration.

#### Defined in

[contexts/issues.ts:21](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/contexts/issues.ts#L21)

___

### createBranch

• `Optional` **createBranch**: `Object`

Open branch configuration

#### Index signature

▪ [label: `string`]: `CreateBranch`

#### Defined in

[contexts/issues.ts:25](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/contexts/issues.ts#L25)

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
