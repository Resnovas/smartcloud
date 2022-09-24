---
id: "internal.AbanondedConfig"
title: "Interface: AbanondedConfig"
sidebar_label: "AbanondedConfig"
custom_edit_url: null
---

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

[src/contexts/methods/checkStale.ts:64](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/checkStale.ts#L64)

___

### comment

• `Optional` **comment**: `string`

The comment to append to the stale issue

#### Inherited from

[StaleConfig](internal.StaleConfig.md).[comment](internal.StaleConfig.md#comment)

#### Defined in

[src/contexts/methods/checkStale.ts:42](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/checkStale.ts#L42)

___

### commentFooter

• `Optional` **commentFooter**: `string`

The comment to append to the footer

#### Inherited from

[StaleConfig](internal.StaleConfig.md).[commentFooter](internal.StaleConfig.md#commentfooter)

#### Defined in

[src/contexts/methods/checkStale.ts:54](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/checkStale.ts#L54)

___

### commentHeader

• `Optional` **commentHeader**: `string`

The comment to append to the header

#### Inherited from

[StaleConfig](internal.StaleConfig.md).[commentHeader](internal.StaleConfig.md#commentheader)

#### Defined in

[src/contexts/methods/checkStale.ts:50](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/checkStale.ts#L50)

___

### condition

• **condition**: [`Condition`](../#condition)[]

The conditions required for this to succeed

#### Inherited from

[StaleConfig](internal.StaleConfig.md).[condition](internal.StaleConfig.md#condition)

#### Defined in

[src/conditions/index.ts:168](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/conditions/index.ts#L168)

___

### days

• **days**: `number`

The days to consider stale

#### Inherited from

[StaleConfig](internal.StaleConfig.md).[days](internal.StaleConfig.md#days)

#### Defined in

[src/contexts/methods/checkStale.ts:38](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/checkStale.ts#L38)

___

### label

• **label**: `string`

The label to use for abanonded issues

#### Defined in

[src/contexts/methods/checkStale.ts:72](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/checkStale.ts#L72)

___

### lock

• `Optional` **lock**: `boolean`

Should the abanonded issue be locked

#### Defined in

[src/contexts/methods/checkStale.ts:68](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/checkStale.ts#L68)

___

### requires

• **requires**: `number`

The number of requires needed for this to succeed

#### Inherited from

[StaleConfig](internal.StaleConfig.md).[requires](internal.StaleConfig.md#requires)

#### Defined in

[src/conditions/index.ts:164](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/conditions/index.ts#L164)

___

### resolve

• `Optional` **resolve**: `string`

The comment to switch when resolved

#### Inherited from

[StaleConfig](internal.StaleConfig.md).[resolve](internal.StaleConfig.md#resolve)

#### Defined in

[src/contexts/methods/checkStale.ts:46](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/checkStale.ts#L46)
