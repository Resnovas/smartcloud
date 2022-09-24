---
id: "Options"
title: "Interface: Options"
sidebar_label: "Options"
sidebar_position: 0
custom_edit_url: null
---

The application options used within Github Actions workflows

## Properties

### configJSON

• `Optional` **configJSON**: [`Runners`](Runners.md)

The json configuration object

#### Defined in

[src/index.ts:125](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/index.ts#L125)

___

### configPath

• `Optional` **configPath**: `string`

The path to find the config

#### Defined in

[src/index.ts:121](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/index.ts#L121)

___

### configRef

• `Optional` **configRef**: `string`

The ref to use when retrieving config

#### Defined in

[src/index.ts:129](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/index.ts#L129)

___

### dryRun

• **dryRun**: `boolean`

should dry run?

#### Defined in

[src/index.ts:137](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/index.ts#L137)

___

### fillEmpty

• **fillEmpty**: `boolean`

Should fill empty values?

#### Defined in

[src/index.ts:141](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/index.ts#L141)

___

### git

• `Optional` **git**: `SimpleGitOptions`

The Git settings to use

#### Defined in

[src/index.ts:153](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/index.ts#L153)

___

### ref

• `Optional` **ref**: `string`

The ref to use

#### Defined in

[src/index.ts:157](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/index.ts#L157)

___

### repo

• `Optional` **repo**: [`Repo`](Repo.md)

The repo to use

#### Defined in

[src/index.ts:149](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/index.ts#L149)

___

### showLogs

• **showLogs**: `boolean`

Should show logs?

#### Defined in

[src/index.ts:133](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/index.ts#L133)

___

### skipDelete

• **skipDelete**: `boolean`

Should skip delete of labels

#### Defined in

[src/index.ts:145](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/index.ts#L145)
