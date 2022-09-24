---
id: "internal.StaleConfig"
title: "Interface: StaleConfig"
sidebar_label: "StaleConfig"
custom_edit_url: null
---

[internal](../modules/internal.md).StaleConfig

The stale configuration

## Hierarchy

- [`SharedConditions`](SharedConditions.md)

  ↳ **`StaleConfig`**

  ↳↳ [`AbanondedConfig`](internal.AbanondedConfig.md)

## Properties

### comment

• `Optional` **comment**: `string`

The comment to append to the stale issue

#### Defined in

[src/contexts/methods/checkStale.ts:42](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/checkStale.ts#L42)

___

### commentFooter

• `Optional` **commentFooter**: `string`

The comment to append to the footer

#### Defined in

[src/contexts/methods/checkStale.ts:54](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/checkStale.ts#L54)

___

### commentHeader

• `Optional` **commentHeader**: `string`

The comment to append to the header

#### Defined in

[src/contexts/methods/checkStale.ts:50](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/checkStale.ts#L50)

___

### condition

• **condition**: [`Condition`](../#condition)[]

The conditions required for this to succeed

#### Inherited from

[SharedConditions](SharedConditions.md).[condition](SharedConditions.md#condition)

#### Defined in

[src/conditions/index.ts:168](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/conditions/index.ts#L168)

___

### days

• **days**: `number`

The days to consider stale

#### Defined in

[src/contexts/methods/checkStale.ts:38](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/checkStale.ts#L38)

___

### requires

• **requires**: `number`

The number of requires needed for this to succeed

#### Inherited from

[SharedConditions](SharedConditions.md).[requires](SharedConditions.md#requires)

#### Defined in

[src/conditions/index.ts:164](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/conditions/index.ts#L164)

___

### resolve

• `Optional` **resolve**: `string`

The comment to switch when resolved

#### Defined in

[src/contexts/methods/checkStale.ts:46](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/checkStale.ts#L46)
