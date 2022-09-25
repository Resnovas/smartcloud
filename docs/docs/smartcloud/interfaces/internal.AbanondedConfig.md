---
id: "internal.AbanondedConfig"
title: "Interface: AbanondedConfig"
sidebar_label: "AbanondedConfig"
custom_edit_url: null
---

<!-- @format -->

[internal](../modules/internal.md).AbanondedConfig

The abanonded configuration

## Hierarchy

- [`StaleConfig`](internal.StaleConfig.md)

  ↳ **`AbanondedConfig`**

## Properties

### close

• `Optional` **close**: `boolean`

Should the abanonded issue be closed

#### Defined in

<<<<<<< HEAD
[src/contexts/methods/checkStale.ts:64](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/checkStale.ts#L64)
=======
[src/contexts/methods/checkStale.ts:64](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/checkStale.ts#L64)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960

---

### comment

• `Optional` **comment**: `string`

The comment to append to the stale issue

#### Inherited from

[StaleConfig](internal.StaleConfig.md).[comment](internal.StaleConfig.md#comment)

#### Defined in

<<<<<<< HEAD
[src/contexts/methods/checkStale.ts:42](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/checkStale.ts#L42)
=======
[src/contexts/methods/checkStale.ts:42](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/checkStale.ts#L42)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960

---

### commentFooter

• `Optional` **commentFooter**: `string`

The comment to append to the footer

#### Inherited from

[StaleConfig](internal.StaleConfig.md).[commentFooter](internal.StaleConfig.md#commentfooter)

#### Defined in

<<<<<<< HEAD
[src/contexts/methods/checkStale.ts:54](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/checkStale.ts#L54)
=======
[src/contexts/methods/checkStale.ts:54](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/checkStale.ts#L54)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960

---

### commentHeader

• `Optional` **commentHeader**: `string`

The comment to append to the header

#### Inherited from

[StaleConfig](internal.StaleConfig.md).[commentHeader](internal.StaleConfig.md#commentheader)

#### Defined in

<<<<<<< HEAD
[src/contexts/methods/checkStale.ts:50](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/checkStale.ts#L50)
=======
[src/contexts/methods/checkStale.ts:50](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/checkStale.ts#L50)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960

---

### condition

• **condition**: [`Condition`](../#condition)[]

The conditions required for this to succeed

#### Inherited from

[StaleConfig](internal.StaleConfig.md).[condition](internal.StaleConfig.md#condition)

#### Defined in

<<<<<<< HEAD
[src/conditions/index.ts:168](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/conditions/index.ts#L168)
=======
[src/conditions/index.ts:168](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/conditions/index.ts#L168)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960

---

### days

• **days**: `number`

The days to consider stale

#### Inherited from

[StaleConfig](internal.StaleConfig.md).[days](internal.StaleConfig.md#days)

#### Defined in

<<<<<<< HEAD
[src/contexts/methods/checkStale.ts:38](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/checkStale.ts#L38)
=======
[src/contexts/methods/checkStale.ts:38](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/checkStale.ts#L38)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960

---

### label

• **label**: `string`

The label to use for abanonded issues

#### Defined in

<<<<<<< HEAD
[src/contexts/methods/checkStale.ts:72](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/checkStale.ts#L72)
=======
[src/contexts/methods/checkStale.ts:72](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/checkStale.ts#L72)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960

---

### lock

• `Optional` **lock**: `boolean`

Should the abanonded issue be locked

#### Defined in

<<<<<<< HEAD
[src/contexts/methods/checkStale.ts:68](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/checkStale.ts#L68)
=======
[src/contexts/methods/checkStale.ts:68](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/checkStale.ts#L68)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960

---

### requires

• **requires**: `number`

The number of requires needed for this to succeed

#### Inherited from

[StaleConfig](internal.StaleConfig.md).[requires](internal.StaleConfig.md#requires)

#### Defined in

<<<<<<< HEAD
[src/conditions/index.ts:164](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/conditions/index.ts#L164)
=======
[src/conditions/index.ts:164](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/conditions/index.ts#L164)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960

---

### resolve

• `Optional` **resolve**: `string`

The comment to switch when resolved

#### Inherited from

[StaleConfig](internal.StaleConfig.md).[resolve](internal.StaleConfig.md#resolve)

#### Defined in

<<<<<<< HEAD
[src/contexts/methods/checkStale.ts:46](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/checkStale.ts#L46)
=======
[src/contexts/methods/checkStale.ts:46](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/checkStale.ts#L46)

> > > > > > > f1c3d7350ef9f5604f99e801f5604678ab957960
