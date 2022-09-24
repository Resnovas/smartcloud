---
id: "internal.ExProjects"
title: "Interface: ExProjects"
sidebar_label: "ExProjects"
custom_edit_url: null
---

[internal](../modules/internal.md).ExProjects

External projects configuration

## Properties

### localProject

• **localProject**: `string`

The local project to sync

#### Defined in

[src/contexts/methods/syncRemoteProject.ts:14](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/syncRemoteProject.ts#L14)

___

### owner

• `Optional` **owner**: `string`

The owner of the project

#### Defined in

[src/contexts/methods/syncRemoteProject.ts:18](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/syncRemoteProject.ts#L18)

___

### project

• **project**: `string`

The project to use

**`Requires`**

owner|user|repo

#### Defined in

[src/contexts/methods/syncRemoteProject.ts:32](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/syncRemoteProject.ts#L32)

___

### repo

• `Optional` **repo**: `string`

The repository name

**`Requires`**

owner

#### Defined in

[src/contexts/methods/syncRemoteProject.ts:27](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/syncRemoteProject.ts#L27)

___

### user

• `Optional` **user**: `string`

The user of the project

#### Defined in

[src/contexts/methods/syncRemoteProject.ts:22](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/syncRemoteProject.ts#L22)
