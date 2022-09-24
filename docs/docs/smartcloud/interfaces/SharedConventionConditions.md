---
id: "SharedConventionConditions"
title: "Interface: SharedConventionConditions"
sidebar_label: "SharedConventionConditions"
sidebar_position: 0
custom_edit_url: null
---

Conventions to use

## Hierarchy

- **`SharedConventionConditions`**

  ↳ [`SharedConventionsConfig`](internal.SharedConventionsConfig.md)

## Properties

### condition

• **condition**: `string` \| [`Condition`](../#condition)[]

The conditions required for this to succeed. You can use the "semanticTitle" to automatically apply thses conditions

#### Defined in

[src/conditions/index.ts:182](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/conditions/index.ts#L182)

___

### requires

• **requires**: `number`

The number of requires needed for this to succeed

#### Defined in

[src/conditions/index.ts:178](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/conditions/index.ts#L178)
