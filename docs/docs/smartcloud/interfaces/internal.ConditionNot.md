---
id: "internal.ConditionNot"
title: "Interface: ConditionNot"
sidebar_label: "ConditionNot"
custom_edit_url: null
---

[internal](../modules/internal.md).ConditionNot

## Properties

### condition

• **condition**: [[`PRConditionConfig`](PRConditionConfig.md) \| [`IssueConditionConfig`](IssueConditionConfig.md) \| [`ProjectConditionConfig`](ProjectConditionConfig.md)]

#### Defined in

src/conditions/util/not.ts:22

___

### requires

• **requires**: `number`

The number of requires needed for this to succeed

#### Defined in

src/conditions/util/not.ts:17

___

### type

• **type**: ``"$not"``

The condition required for this to succeed. You can use the "semanticTitle" to automatically apply thses ccondition

#### Defined in

src/conditions/util/not.ts:21
