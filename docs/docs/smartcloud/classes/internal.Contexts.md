---
id: "internal.Contexts"
title: "Class: Contexts"
sidebar_label: "Contexts"
custom_edit_url: null
---

[internal](../modules/internal.md).Contexts

## Hierarchy

- **`Contexts`**

  ↳ [`Issues`](Issues.md)

  ↳ [`Project`](Project.md)

  ↳ [`PullRequests`](PullRequests.md)

  ↳ [`Schedule`](Schedule.md)

## Constructors

### constructor

• **new Contexts**(`util`, `runners`, `configs`, `curContext`, `dryRun`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `util` | [`Utils`](Utils.md) |
| `runners` | [`Runners`](../interfaces/Runners.md) |
| `configs` | [`Config`](../interfaces/Config.md) |
| `curContext` | [`CurContext`](../#curcontext) |
| `dryRun` | `boolean` |

#### Defined in

[src/contexts/methods/index.ts:55](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/index.ts#L55)

## Properties

### config

• **config**: [`IssueConfig`](../interfaces/IssueConfig.md) \| [`PullRequestConfig`](../interfaces/PullRequestConfig.md) \| [`ProjectConfig`](../interfaces/ProjectConfig.md)

#### Defined in

[src/contexts/methods/index.ts:48](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/index.ts#L48)

___

### configs

• **configs**: [`Config`](../interfaces/Config.md)

#### Defined in

[src/contexts/methods/index.ts:47](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/index.ts#L47)

___

### context

• **context**: [`IssueContext`](../interfaces/IssueContext.md) \| [`PRContext`](../interfaces/PRContext.md) \| [`ProjectContext`](../interfaces/ProjectContext.md) \| `Partial`<[`ScheduleContext`](../interfaces/ScheduleContext.md)\>

#### Defined in

[src/contexts/methods/index.ts:50](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/index.ts#L50)

___

### conventions

• **conventions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `enforce` | (`that`: [`Issues`](Issues.md) \| [`PullRequests`](PullRequests.md) \| [`Project`](Project.md)) => `Promise`<`undefined` \| `boolean`\> |

#### Defined in

[src/contexts/methods/index.ts:101](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/index.ts#L101)

___

### curContext

• **curContext**: [`CurContext`](../#curcontext)

#### Defined in

[src/contexts/methods/index.ts:49](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/index.ts#L49)

___

### dryRun

• **dryRun**: `boolean`

#### Defined in

[src/contexts/methods/index.ts:54](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/index.ts#L54)

___

### newVersion

• `Optional` **newVersion**: [`Version`](../interfaces/Version.md) = `{}`

#### Defined in

[src/contexts/methods/index.ts:51](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/index.ts#L51)

___

### retryLimit

• **retryLimit**: `number`

#### Defined in

[src/contexts/methods/index.ts:53](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/index.ts#L53)

___

### runners

• **runners**: [`Runners`](../interfaces/Runners.md)

#### Defined in

[src/contexts/methods/index.ts:46](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/index.ts#L46)

___

### util

• **util**: [`Utils`](Utils.md)

#### Defined in

[src/contexts/methods/index.ts:52](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/index.ts#L52)

## Methods

### applyLabels

▸ **applyLabels**(`that`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `that` | [`UtilThis`](../#utilthis) |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/contexts/methods/index.ts:94](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/index.ts#L94)

___

### assignProject

▸ **assignProject**(`that`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `that` | [`Issues`](Issues.md) \| [`PullRequests`](PullRequests.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/contexts/methods/index.ts:93](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/index.ts#L93)

___

### automaticApprove

▸ **automaticApprove**(`that`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `that` | [`PullRequests`](PullRequests.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/contexts/methods/index.ts:97](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/index.ts#L97)

___

### bumpVersion

▸ **bumpVersion**(`that`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `that` | [`PullRequests`](PullRequests.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/contexts/methods/index.ts:99](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/index.ts#L99)

___

### checkStale

▸ **checkStale**(`that`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `that` | [`Issues`](Issues.md) \| [`PullRequests`](PullRequests.md) \| [`Project`](Project.md) \| [`Schedule`](Schedule.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/contexts/methods/index.ts:95](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/index.ts#L95)

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

#### Defined in

[src/contexts/methods/index.ts:107](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/index.ts#L107)

___

### requestApprovals

▸ **requestApprovals**(`that`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `that` | [`PullRequests`](PullRequests.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/contexts/methods/index.ts:98](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/index.ts#L98)

___

### syncRemoteProject

▸ **syncRemoteProject**(`that`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `that` | [`Project`](Project.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/contexts/methods/index.ts:92](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/methods/index.ts#L92)
