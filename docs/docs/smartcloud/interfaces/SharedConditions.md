---
id: "SharedConditions"
title: "Interface: SharedConditions"
sidebar_label: "SharedConditions"
sidebar_position: 0
custom_edit_url: null
---

Shared conditions used by all types of events.

## Hierarchy

- **`SharedConditions`**

  ↳ [`StaleConfig`](internal.StaleConfig.md)

## Properties

### condition

• **condition**: [`Condition`](../#condition)[]

The conditions required for this to succeed

#### Defined in

[src/conditions/index.ts:168](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/conditions/index.ts#L168)

___

### requires

• **requires**: `number`

The number of requires needed for this to succeed

#### Defined in

[src/conditions/index.ts:164](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/conditions/index.ts#L164)
