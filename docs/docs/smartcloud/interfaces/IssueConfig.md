---
id: "IssueConfig"
title: "Interface: IssueConfig"
sidebar_label: "IssueConfig"
sidebar_position: 0
custom_edit_url: null
---

<!-- @format -->

The issue configuration

## Hierarchy

- [`SharedConfig`](SharedConfig.md)

  ↳ **`IssueConfig`**

## Properties

### assignProject

• `Optional` **assignProject**: [`AssignProject`](internal.AssignProject.md)[]

Assign project configuration.

#### Defined in

<<<<<<< HEAD:docs/docs/smartcloud/interfaces/IssueConfig.md
[src/contexts/issues.ts:21](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/issues.ts#L21)
=======
[src/contexts/issues.ts:21](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/issues.ts#L21)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960:docs/docs/release-mastermind/interfaces/IssueConfig.md

---

### createBranch

• `Optional` **createBranch**: `Object`

Open branch configuration

#### Index signature

▪ [label: `string`]: [`CreateBranch`](../modules/internal.md#createbranch)

#### Defined in

<<<<<<< HEAD:docs/docs/smartcloud/interfaces/IssueConfig.md
[src/contexts/issues.ts:25](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/issues.ts#L25)
=======
[src/contexts/issues.ts:25](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/issues.ts#L25)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960:docs/docs/release-mastermind/interfaces/IssueConfig.md

---

### enforceConventions

• `Optional` **enforceConventions**: [`EnforceConventions`](internal.EnforceConventions.md)

The enforceConventions configuration

#### Inherited from

[SharedConfig](SharedConfig.md).[enforceConventions](SharedConfig.md#enforceconventions)

#### Defined in

<<<<<<< HEAD:docs/docs/smartcloud/interfaces/IssueConfig.md
[src/action.ts:126](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L126)
=======
[src/action.ts:121](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/action.ts#L121)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960:docs/docs/release-mastermind/interfaces/IssueConfig.md

---

### labels

• `Optional` **labels**: `Object`

The labels to be applied

#### Index signature

▪ [key: `string`]: [`IssueConditionConfig`](IssueConditionConfig.md) \| [`ProjectConditionConfig`](ProjectConditionConfig.md) \| [`PRConditionConfig`](PRConditionConfig.md) \| [`ScheduleConditionConfig`](ScheduleConditionConfig.md) \| [`SharedConditions`](SharedConditions.md)

#### Inherited from

[SharedConfig](SharedConfig.md).[labels](SharedConfig.md#labels)

#### Defined in

<<<<<<< HEAD:docs/docs/smartcloud/interfaces/IssueConfig.md
[src/action.ts:134](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L134)
=======
[src/action.ts:129](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/action.ts#L129)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960:docs/docs/release-mastermind/interfaces/IssueConfig.md

---

### ref

• `Optional` **ref**: `string`

The reference used internally

#### Inherited from

[SharedConfig](SharedConfig.md).[ref](SharedConfig.md#ref)

#### Defined in

<<<<<<< HEAD:docs/docs/smartcloud/interfaces/IssueConfig.md
[src/action.ts:122](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L122)
=======
[src/action.ts:117](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/action.ts#L117)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960:docs/docs/release-mastermind/interfaces/IssueConfig.md

---

### stale

• `Optional` **stale**: [`Stale`](internal.Stale.md)

The stale configuration

#### Inherited from

[SharedConfig](SharedConfig.md).[stale](SharedConfig.md#stale)

#### Defined in

<<<<<<< HEAD:docs/docs/smartcloud/interfaces/IssueConfig.md
[src/action.ts:130](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L130)
=======
[src/action.ts:125](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/action.ts#L125)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960:docs/docs/release-mastermind/interfaces/IssueConfig.md
