---
id: "internal.AssignProject"
title: "Interface: AssignProject"
sidebar_label: "AssignProject"
custom_edit_url: null
---

<!-- @format -->

[internal](../modules/internal.md).AssignProject

Assign project configuration

## Hierarchy

- [`IssueConditionConfig`](IssueConditionConfig.md)

  ↳ **`AssignProject`**

## Properties

### column

• **column**: `string`

The column to use

#### Defined in

<<<<<<< HEAD
[src/contexts/methods/assignProject.ts:34](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/assignProject.ts#L34)
=======
[src/contexts/methods/assignProject.ts:34](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/assignProject.ts#L34)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960

---

### condition

• **condition**: [`Condition`](../#condition)[]

The conditions required for this to succeed

#### Inherited from

[IssueConditionConfig](IssueConditionConfig.md).[condition](IssueConditionConfig.md#condition)

#### Defined in

<<<<<<< HEAD
[src/conditions/index.ts:210](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/conditions/index.ts#L210)
=======
[src/conditions/index.ts:210](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/conditions/index.ts#L210)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960

---

### owner

• `Optional` **owner**: `string`

The owner of the project

#### Defined in

<<<<<<< HEAD
[src/contexts/methods/assignProject.ts:16](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/assignProject.ts#L16)
=======
[src/contexts/methods/assignProject.ts:16](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/assignProject.ts#L16)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960

---

### project

• **project**: `string`

The project to use

**`Requires`**

owner|user|repo

#### Defined in

<<<<<<< HEAD
[src/contexts/methods/assignProject.ts:30](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/assignProject.ts#L30)
=======
[src/contexts/methods/assignProject.ts:30](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/assignProject.ts#L30)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960

---

### repo

• `Optional` **repo**: `string`

The repository name

**`Requires`**

owner

#### Defined in

<<<<<<< HEAD
[src/contexts/methods/assignProject.ts:25](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/assignProject.ts#L25)
=======
[src/contexts/methods/assignProject.ts:25](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/assignProject.ts#L25)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960

---

### requires

• **requires**: `number`

The number of requires needed for this to succeed

#### Inherited from

[IssueConditionConfig](IssueConditionConfig.md).[requires](IssueConditionConfig.md#requires)

#### Defined in

<<<<<<< HEAD
[src/conditions/index.ts:206](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/conditions/index.ts#L206)
=======
[src/conditions/index.ts:206](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/conditions/index.ts#L206)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960

---

### user

• `Optional` **user**: `string`

The user of the project

#### Defined in

<<<<<<< HEAD
[src/contexts/methods/assignProject.ts:20](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/assignProject.ts#L20)
=======
[src/contexts/methods/assignProject.ts:20](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/assignProject.ts#L20)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960
