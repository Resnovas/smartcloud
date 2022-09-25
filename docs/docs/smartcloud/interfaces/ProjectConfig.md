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

▪ [milestone: `string`]: [`Milestones`](internal.Milestones.md)

#### Defined in

<<<<<<< HEAD:docs/docs/smartcloud/interfaces/ProjectConfig.md
[src/contexts/projects.ts:30](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/projects.ts#L30)
=======
[src/contexts/projects.ts:30](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/projects.ts#L30)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960:docs/docs/release-mastermind/interfaces/ProjectConfig.md

---

### enforceConventions

• `Optional` **enforceConventions**: [`EnforceConventions`](internal.EnforceConventions.md)

The enforceConventions configuration

#### Inherited from

[SharedConfig](SharedConfig.md).[enforceConventions](SharedConfig.md#enforceconventions)

#### Defined in

<<<<<<< HEAD:docs/docs/smartcloud/interfaces/ProjectConfig.md
[src/action.ts:126](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L126)
=======
[src/action.ts:121](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/action.ts#L121)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960:docs/docs/release-mastermind/interfaces/ProjectConfig.md

---

### labels

• `Optional` **labels**: `Object`

The labels to be applied

#### Index signature

▪ [key: `string`]: [`IssueConditionConfig`](IssueConditionConfig.md) \| [`ProjectConditionConfig`](ProjectConditionConfig.md) \| [`PRConditionConfig`](PRConditionConfig.md) \| [`ScheduleConditionConfig`](ScheduleConditionConfig.md) \| [`SharedConditions`](SharedConditions.md)

#### Inherited from

[SharedConfig](SharedConfig.md).[labels](SharedConfig.md#labels)

#### Defined in

<<<<<<< HEAD:docs/docs/smartcloud/interfaces/ProjectConfig.md
[src/action.ts:134](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L134)
=======
[src/action.ts:129](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/action.ts#L129)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960:docs/docs/release-mastermind/interfaces/ProjectConfig.md

---

### openBranch

• `Optional` **openBranch**: [`ProjectCreateBranch`](internal.ProjectCreateBranch.md)

Open branch configuration

#### Defined in

<<<<<<< HEAD:docs/docs/smartcloud/interfaces/ProjectConfig.md
[src/contexts/projects.ts:26](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/projects.ts#L26)
=======
[src/contexts/projects.ts:26](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/projects.ts#L26)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960:docs/docs/release-mastermind/interfaces/ProjectConfig.md

---

### ref

• `Optional` **ref**: `string`

The reference used internally

#### Inherited from

[SharedConfig](SharedConfig.md).[ref](SharedConfig.md#ref)

#### Defined in

<<<<<<< HEAD:docs/docs/smartcloud/interfaces/ProjectConfig.md
[src/action.ts:122](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L122)
=======
[src/action.ts:117](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/action.ts#L117)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960:docs/docs/release-mastermind/interfaces/ProjectConfig.md

---

### stale

• `Optional` **stale**: [`Stale`](internal.Stale.md)

The stale configuration

#### Inherited from

[SharedConfig](SharedConfig.md).[stale](SharedConfig.md#stale)

#### Defined in

<<<<<<< HEAD:docs/docs/smartcloud/interfaces/ProjectConfig.md
[src/action.ts:130](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L130)
=======
[src/action.ts:125](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/action.ts#L125)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960:docs/docs/release-mastermind/interfaces/ProjectConfig.md

---

### syncRemote

• `Optional` **syncRemote**: [`ExProjects`](internal.ExProjects.md)[]

Syncronise remote repository configuration.

#### Defined in

<<<<<<< HEAD:docs/docs/smartcloud/interfaces/ProjectConfig.md
[src/contexts/projects.ts:22](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/projects.ts#L22)
=======
[src/contexts/projects.ts:22](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/projects.ts#L22)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960:docs/docs/release-mastermind/interfaces/ProjectConfig.md
