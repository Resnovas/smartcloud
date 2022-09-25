---
id: "internal.SharedConventionsConfig"
title: "Interface: SharedConventionsConfig"
sidebar_label: "SharedConventionsConfig"
custom_edit_url: null
---

<!-- @format -->

[internal](../modules/internal.md).SharedConventionsConfig

Conventions to use

## Hierarchy

- [`SharedConventionConditions`](SharedConventionConditions.md)

  ↳ **`SharedConventionsConfig`**

## Properties

### condition

• **condition**: `string` \| [`Condition`](../#condition)[]

The conditions required for this to succeed. You can use the "semanticTitle" to automatically apply thses conditions

#### Inherited from

[SharedConventionConditions](SharedConventionConditions.md).[condition](SharedConventionConditions.md#condition)

#### Defined in

<<<<<<< HEAD
[src/conditions/index.ts:182](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/conditions/index.ts#L182)
=======
[src/conditions/index.ts:182](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/conditions/index.ts#L182)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960

---

### contexts

• `Optional` **contexts**: `string`[]

The contexts to use. Use this in combernation with "semanticTitle"

**`Requires`**

conditions: "semanticTitle"

#### Defined in

<<<<<<< HEAD
[src/contexts/methods/conventions.ts:48](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/conventions.ts#L48)
=======
[src/contexts/methods/conventions.ts:48](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/conventions.ts#L48)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960

---

### failedComment

• **failedComment**: `string`

The failed comment to use

#### Defined in

<<<<<<< HEAD
[src/contexts/methods/conventions.ts:43](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/conventions.ts#L43)
=======
[src/contexts/methods/conventions.ts:43](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/conventions.ts#L43)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960

---

### requires

• **requires**: `number`

The number of requires needed for this to succeed

#### Inherited from

[SharedConventionConditions](SharedConventionConditions.md).[requires](SharedConventionConditions.md#requires)

#### Defined in

<<<<<<< HEAD
[src/conditions/index.ts:178](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/conditions/index.ts#L178)
=======
[src/conditions/index.ts:178](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/conditions/index.ts#L178)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960
