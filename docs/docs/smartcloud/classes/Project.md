---
id: "Project"
title: "Class: Project"
sidebar_label: "Project"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- [`Contexts`](internal.Contexts.md)

  ↳ **`Project`**

## Constructors

### constructor

• **new Project**(`util`, `runners`, `configs`, `curContext`, `dryRun`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `util` | [`Utils`](Utils.md) |
| `runners` | [`Runners`](../interfaces/Runners.md) |
| `configs` | [`Config`](../interfaces/Config.md) |
| `curContext` | [`CurContext`](../#curcontext) |
| `dryRun` | `boolean` |

#### Overrides

[Contexts](internal.Contexts.md).[constructor](internal.Contexts.md#constructor)

#### Defined in

[src/contexts/projects.ts:38](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/projects.ts#L38)

## Properties

### config

• **config**: [`ProjectConfig`](../interfaces/ProjectConfig.md)

#### Overrides

[Contexts](internal.Contexts.md).[config](internal.Contexts.md#config)

#### Defined in

[src/contexts/projects.ts:37](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/projects.ts#L37)

___

### configs

• **configs**: [`Config`](../interfaces/Config.md)

#### Inherited from

[Contexts](internal.Contexts.md).[configs](internal.Contexts.md#configs)

#### Defined in

[src/contexts/methods/index.ts:47](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/index.ts#L47)

___

### context

• **context**: [`ProjectContext`](../interfaces/ProjectContext.md)

#### Overrides

[Contexts](internal.Contexts.md).[context](internal.Contexts.md#context)

#### Defined in

[src/contexts/projects.ts:36](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/projects.ts#L36)

___

### conventions

• **conventions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `enforce` | (`that`: [`Issues`](Issues.md) \| [`PullRequests`](PullRequests.md) \| [`Project`](Project.md)) => `Promise`<`undefined` \| `boolean`\> |

#### Inherited from

[Contexts](internal.Contexts.md).[conventions](internal.Contexts.md#conventions)

#### Defined in

[src/contexts/methods/index.ts:101](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/index.ts#L101)

___

### curContext

• **curContext**: [`CurContext`](../#curcontext)

#### Inherited from

[Contexts](internal.Contexts.md).[curContext](internal.Contexts.md#curcontext)

#### Defined in

[src/contexts/methods/index.ts:49](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/index.ts#L49)

___

### dryRun

• **dryRun**: `boolean`

#### Inherited from

[Contexts](internal.Contexts.md).[dryRun](internal.Contexts.md#dryrun)

#### Defined in

[src/contexts/methods/index.ts:54](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/index.ts#L54)

___

### newVersion

• `Optional` **newVersion**: [`Version`](../interfaces/Version.md) = `{}`

#### Inherited from

[Contexts](internal.Contexts.md).[newVersion](internal.Contexts.md#newversion)

#### Defined in

[src/contexts/methods/index.ts:51](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/index.ts#L51)

___

### retryLimit

• **retryLimit**: `number`

#### Inherited from

[Contexts](internal.Contexts.md).[retryLimit](internal.Contexts.md#retrylimit)

#### Defined in

[src/contexts/methods/index.ts:53](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/index.ts#L53)

___

### runners

• **runners**: [`Runners`](../interfaces/Runners.md)

#### Inherited from

[Contexts](internal.Contexts.md).[runners](internal.Contexts.md#runners)

#### Defined in

[src/contexts/methods/index.ts:46](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/index.ts#L46)

___

### util

• **util**: [`Utils`](Utils.md)

#### Inherited from

[Contexts](internal.Contexts.md).[util](internal.Contexts.md#util)

#### Defined in

[src/contexts/methods/index.ts:52](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/index.ts#L52)

## Methods

### applyLabels

▸ **applyLabels**(`that`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `that` | [`UtilThis`](../#utilthis) |

#### Returns

`Promise`<`void`\>

#### Inherited from

[Contexts](internal.Contexts.md).[applyLabels](internal.Contexts.md#applylabels)

#### Defined in

[src/contexts/methods/index.ts:94](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/index.ts#L94)

___

### assignProject

▸ **assignProject**(`that`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `that` | [`Issues`](Issues.md) \| [`PullRequests`](PullRequests.md) |

#### Returns

`Promise`<`void`\>

#### Inherited from

[Contexts](internal.Contexts.md).[assignProject](internal.Contexts.md#assignproject)

#### Defined in

[src/contexts/methods/index.ts:93](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/index.ts#L93)

___

### automaticApprove

▸ **automaticApprove**(`that`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `that` | [`PullRequests`](PullRequests.md) |

#### Returns

`Promise`<`void`\>

#### Inherited from

[Contexts](internal.Contexts.md).[automaticApprove](internal.Contexts.md#automaticapprove)

#### Defined in

[src/contexts/methods/index.ts:97](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/index.ts#L97)

___

### bumpVersion

▸ **bumpVersion**(`that`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `that` | [`PullRequests`](PullRequests.md) |

#### Returns

`Promise`<`void`\>

#### Inherited from

[Contexts](internal.Contexts.md).[bumpVersion](internal.Contexts.md#bumpversion)

#### Defined in

[src/contexts/methods/index.ts:99](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/index.ts#L99)

___

### checkStale

▸ **checkStale**(`that`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `that` | [`Issues`](Issues.md) \| [`PullRequests`](PullRequests.md) \| [`Project`](Project.md) \| [`Schedule`](Schedule.md) |

#### Returns

`Promise`<`void`\>

#### Inherited from

[Contexts](internal.Contexts.md).[checkStale](internal.Contexts.md#checkstale)

#### Defined in

[src/contexts/methods/index.ts:95](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/index.ts#L95)

___

### convertColumnStringsToIDArray

▸ **convertColumnStringsToIDArray**(`columns`): `Promise`<`number`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `columns` | [`Column`](../modules/internal.md#column)[] |

#### Returns

`Promise`<`number`[]\>

#### Defined in

[src/contexts/projects.ts:191](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/projects.ts#L191)

___

### createComment

▸ **createComment**(`this`, `jobName`, `success`, `options?`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `this` | [`Issues`](Issues.md) \| [`PullRequests`](PullRequests.md) \| [`Project`](Project.md) \| [`Schedule`](Schedule.md) |
| `jobName` | `string` |
| `success` | `boolean` |
| `options?` | `Object` |
| `options.body?` | `string` |
| `options.event?` | [`Event`](../#event) |

#### Returns

`Promise`<`void`\>

#### Inherited from

[Contexts](internal.Contexts.md).[createComment](internal.Contexts.md#createcomment)

#### Defined in

[src/contexts/methods/index.ts:107](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/index.ts#L107)

___

### requestApprovals

▸ **requestApprovals**(`that`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `that` | [`PullRequests`](PullRequests.md) |

#### Returns

`Promise`<`void`\>

#### Inherited from

[Contexts](internal.Contexts.md).[requestApprovals](internal.Contexts.md#requestapprovals)

#### Defined in

[src/contexts/methods/index.ts:98](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/index.ts#L98)

___

### run

▸ **run**(`attempt?`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `attempt?` | `number` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/contexts/projects.ts:134](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/projects.ts#L134)

___

### syncRemoteProject

▸ **syncRemoteProject**(`that`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `that` | [`Project`](Project.md) |

#### Returns

`Promise`<`void`\>

#### Inherited from

[Contexts](internal.Contexts.md).[syncRemoteProject](internal.Contexts.md#syncremoteproject)

#### Defined in

[src/contexts/methods/index.ts:92](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/index.ts#L92)

___

### parse

▸ `Static` **parse**(`utils`, `config`, `context`): `Promise`<`undefined` \| [`ProjectContext`](../interfaces/ProjectContext.md)\>

Parse the Project Context

**`Author`**

IvanFon, TGTGamer, jbinda

**`Since`**

1.0.0

#### Parameters

| Name | Type |
| :------ | :------ |
| `utils` | [`Utils`](Utils.md) |
| `config` | [`Config`](../interfaces/Config.md) |
| `context` | `Context` |

#### Returns

`Promise`<`undefined` \| [`ProjectContext`](../interfaces/ProjectContext.md)\>

#### Defined in

[src/contexts/projects.ts:65](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/projects.ts#L65)
