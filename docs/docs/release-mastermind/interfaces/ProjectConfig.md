---
id: "ProjectConfig"
title: "Interface: ProjectConfig"
sidebar_label: "ProjectConfig"
sidebar_position: 0
custom_edit_url: null
---

<!-- @format -->

The project configuration

## Hierarchy

- [`SharedConfig`](SharedConfig.md)

  ↳ **`ProjectConfig`**

## Properties

### assignMilestone

• `Optional` **assignMilestone**: `Object`

Assign to milestone configuration

#### Index signature

▪ [milestone: `string`]: `Milestones`

#### Defined in

[contexts/projects.ts:30](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/contexts/projects.ts#L30)

---

### enforceConventions

• `Optional` **enforceConventions**: `EnforceConventions`

    The enforceConventions configuration

#### Inherited from

[SharedConfig](SharedConfig.md).[enforceConventions](SharedConfig.md#enforceconventions)

#### Defined in

[action.ts:119](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L119)

---

### labels

• `Optional` **labels**: `Object`

The labels to be applied

#### Index signature

▪ [key: `string`]: [`IssueConditionConfig`](IssueConditionConfig.md) \| [`ProjectConditionConfig`](ProjectConditionConfig.md) \| [`PRConditionConfig`](PRConditionConfig.md) \| [`ScheduleConditionConfig`](ScheduleConditionConfig.md) \| [`SharedConditions`](SharedConditions.md)

#### Inherited from

[SharedConfig](SharedConfig.md).[labels](SharedConfig.md#labels)

#### Defined in

[action.ts:127](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L127)

---

### openBranch

• `Optional` **openBranch**: `ProjectCreateBranch`

Open branch configuration

#### Defined in

[contexts/projects.ts:26](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/contexts/projects.ts#L26)

---

### ref

• `Optional` **ref**: `string`

The reference used internally

#### Inherited from

[SharedConfig](SharedConfig.md).[ref](SharedConfig.md#ref)

#### Defined in

[action.ts:115](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L115)

---

### stale

• `Optional` **stale**: `Stale`

    The stale configuration

#### Inherited from

[SharedConfig](SharedConfig.md).[stale](SharedConfig.md#stale)

#### Defined in

[action.ts:123](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L123)

---

### syncRemote

• `Optional` **syncRemote**: `ExProjects`[]

Syncronise remote repository configuration.

#### Defined in

[contexts/projects.ts:22](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/contexts/projects.ts#L22)
