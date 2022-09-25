---
id: "internal.AssignProject"
title: "Interface: AssignProject"
sidebar_label: "AssignProject"
custom_edit_url: null
---

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

[src/contexts/methods/assignProject.ts:34](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/assignProject.ts#L34)

___

### condition

• **condition**: [`Condition`](../#condition)[]

The conditions required for this to succeed

#### Inherited from

[IssueConditionConfig](IssueConditionConfig.md).[condition](IssueConditionConfig.md#condition)

#### Defined in

[src/conditions/index.ts:210](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/conditions/index.ts#L210)

___

### owner

• `Optional` **owner**: `string`

The owner of the project

#### Defined in

[src/contexts/methods/assignProject.ts:16](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/assignProject.ts#L16)

___

### project

• **project**: `string`

The project to use

**`Requires`**

owner|user|repo

#### Defined in

[src/contexts/methods/assignProject.ts:30](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/assignProject.ts#L30)

___

### repo

• `Optional` **repo**: `string`

The repository name

**`Requires`**

owner

#### Defined in

[src/contexts/methods/assignProject.ts:25](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/assignProject.ts#L25)

___

### requires

• **requires**: `number`

The number of requires needed for this to succeed

#### Inherited from

[IssueConditionConfig](IssueConditionConfig.md).[requires](IssueConditionConfig.md#requires)

#### Defined in

[src/conditions/index.ts:206](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/conditions/index.ts#L206)

___

### user

• `Optional` **user**: `string`

The user of the project

#### Defined in

[src/contexts/methods/assignProject.ts:20](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/assignProject.ts#L20)
