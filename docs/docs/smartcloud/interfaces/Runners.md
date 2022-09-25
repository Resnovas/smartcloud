---
id: "Runners"
title: "Interface: Runners"
sidebar_label: "Runners"
sidebar_position: 0
custom_edit_url: null
---

## Properties

<<<<<<< HEAD
### $schema

• **$schema**: `string`

Declaritively specify which schema you want to use. This defaults to our latest schema specified at: https://raw.githubusercontent.com/resnovas/smartcloud/main/schema.json

**`Default`**

https://raw.githubusercontent.com/resnovas/smartcloud/main/schema.json

#### Defined in

[src/action.ts:35](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L35)

___

=======
>>>>>>> f1c3d7350ef9f5604f99e801f5604678ab957960
### labels

• `Optional` **labels**: [`Labels`](Labels.md)

Declaritively specify all the labels that shuold exist in this repository, and initialise them.
You will use the names specified here later to apply these same labels to issues and pull requests.

#### Defined in

<<<<<<< HEAD
[src/action.ts:40](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L40)
=======
[src/action.ts:35](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/action.ts#L35)
>>>>>>> f1c3d7350ef9f5604f99e801f5604678ab957960

___

### runners

• **runners**: [`Config`](Config.md)[]

This defines all the diffent configurations for your repository. 
You can have as many as you like. You can use this within Mono-repositories to have different configurations for different projects.
You can also have diffeent configurations for different branches.

#### Defined in

<<<<<<< HEAD
[src/action.ts:46](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/action.ts#L46)
=======
[src/action.ts:41](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/action.ts#L41)
>>>>>>> f1c3d7350ef9f5604f99e801f5604678ab957960
