---
id: "Utils"
title: "Class: Utils"
sidebar_label: "Utils"
sidebar_position: 0
custom_edit_url: null
---

## Constructors

### constructor

• **new Utils**(`props`, `options`, `__namedParameters`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`ApiProps`](../interfaces/ApiProps.md) |
| `options` | `Object` |
| `options.dryRun` | `boolean` |
| `options.ref?` | `string` |
| `options.skipDelete` | `boolean` |
| `__namedParameters` | `Object` |
| `__namedParameters.git?` | `SimpleGitOptions` |

#### Defined in

[src/utils/index.ts:24](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/utils/index.ts#L24)

## Properties

### api

• **api**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `files` | { `get`: (`file`: `string`, `ref?`: `string`) => `Promise`<`string`\> ; `list`: (`IDNumber`: `number`) => `Promise`<`string`[]\>  } |
| `files.get` | (`file`: `string`, `ref?`: `string`) => `Promise`<`string`\> |
| `files.list` | (`IDNumber`: `number`) => `Promise`<`string`[]\> |
| `issues` | { `comments`: { `create`: (`IDNumber`: `number`, `body`: `string`) => `Promise`<``false`` \| {}\> ; `delete`: (`comment_id`: `number`) => `Promise`<``false``\> ; `get`: (`IDNumber`: `number`) => `Promise`<{}\> ; `list`: (`IDNumber`: `number`) => `Promise`<{}[]\> ; `update`: (`comment_id`: `number`, `body`: `string`) => `Promise`<``false`` \| {}\>  } ; `create`: (`title`: `string`, `body`: `string`, `labels`: `string`[], `assignees`: `string`[], `milestone`: `string`) => `Promise`<``false`` \| {}\> ; `get`: (`IDNumber`: `number`) => `Promise`<{}\> ; `list`: (`__namedParameters`: { `direction?`: ``"asc"`` \| ``"desc"`` ; `sort?`: ``"created"`` \| ``"updated"`` \| ``"comments"`` ; `state?`: ``"open"`` \| ``"closed"`` \| ``"all"``  }) => `Promise`<{}[]\>  } |
| `issues.comments` | { `create`: (`IDNumber`: `number`, `body`: `string`) => `Promise`<``false`` \| {}\> ; `delete`: (`comment_id`: `number`) => `Promise`<``false``\> ; `get`: (`IDNumber`: `number`) => `Promise`<{}\> ; `list`: (`IDNumber`: `number`) => `Promise`<{}[]\> ; `update`: (`comment_id`: `number`, `body`: `string`) => `Promise`<``false`` \| {}\>  } |
| `issues.comments.create` | (`IDNumber`: `number`, `body`: `string`) => `Promise`<``false`` \| {}\> |
| `issues.comments.delete` | (`comment_id`: `number`) => `Promise`<``false``\> |
| `issues.comments.get` | (`IDNumber`: `number`) => `Promise`<{}\> |
| `issues.comments.list` | (`IDNumber`: `number`) => `Promise`<{}[]\> |
| `issues.comments.update` | (`comment_id`: `number`, `body`: `string`) => `Promise`<``false`` \| {}\> |
| `issues.create` | (`title`: `string`, `body`: `string`, `labels`: `string`[], `assignees`: `string`[], `milestone`: `string`) => `Promise`<``false`` \| {}\> |
| `issues.get` | (`IDNumber`: `number`) => `Promise`<{}\> |
| `issues.list` | (`__namedParameters`: { `direction?`: ``"asc"`` \| ``"desc"`` ; `sort?`: ``"created"`` \| ``"updated"`` \| ``"comments"`` ; `state?`: ``"open"`` \| ``"closed"`` \| ``"all"``  }) => `Promise`<{}[]\> |
| `labels` | { `add`: (`IDNumber`: `number`, `label`: `string`) => `Promise`<`void`\> ; `create`: (`label`: [`Label`](../interfaces/Label.md)) => `Promise`<`void`\> ; `del`: (`name`: `string`) => `Promise`<`void`\> ; `get`: () => `Promise`<[`Labels`](../interfaces/Labels.md)\> ; `remove`: (`IDNumber`: `number`, `label`: `string`) => `Promise`<`void`\> ; `update`: (`current_name`: `string`, `label`: [`Label`](../interfaces/Label.md)) => `Promise`<`void`\>  } |
| `labels.add` | (`IDNumber`: `number`, `label`: `string`) => `Promise`<`void`\> |
| `labels.create` | (`label`: [`Label`](../interfaces/Label.md)) => `Promise`<`void`\> |
| `labels.del` | (`name`: `string`) => `Promise`<`void`\> |
| `labels.get` | () => `Promise`<[`Labels`](../interfaces/Labels.md)\> |
| `labels.remove` | (`IDNumber`: `number`, `label`: `string`) => `Promise`<`void`\> |
| `labels.update` | (`current_name`: `string`, `label`: [`Label`](../interfaces/Label.md)) => `Promise`<`void`\> |
| `project` | { `card`: { `create`: (`content_id`: `number`, `column_id`: `number`, `content_type?`: ``"Issue"`` \| ``"PullRequest"``) => `Promise`<``false`` \| {}\> ; `get`: (`card_id`: `number`) => `Promise`<{}\> ; `move`: (`card_id`: `number`, `column_id`: `number`) => `Promise`<``false`` \| `OctokitResponse`<{ `[key: string]`: `unknown`;  }, ``201``\>\>  } ; `column`: { `get`: (`column_id`: `number`) => `Promise`<{}\> ; `list`: (`project_id`: `number`) => `Promise`<{}[]\> ; `listCards`: (`column_id`: `number`) => `Promise`<{}[]\>  } ; `projects`: { `get`: (`project_id`: `number`) => `Promise`<{}\> ; `org`: (`org`: `string`) => `Promise`<{}[]\> ; `repo`: (`owner`: `string`, `repo`: `string`) => `Promise`<{}[]\> ; `user`: (`user`: `string`) => `Promise`<{}[]\>  }  } |
| `project.card` | { `create`: (`content_id`: `number`, `column_id`: `number`, `content_type?`: ``"Issue"`` \| ``"PullRequest"``) => `Promise`<``false`` \| {}\> ; `get`: (`card_id`: `number`) => `Promise`<{}\> ; `move`: (`card_id`: `number`, `column_id`: `number`) => `Promise`<``false`` \| `OctokitResponse`<{ `[key: string]`: `unknown`;  }, ``201``\>\>  } |
| `project.card.create` | (`content_id`: `number`, `column_id`: `number`, `content_type?`: ``"Issue"`` \| ``"PullRequest"``) => `Promise`<``false`` \| {}\> |
| `project.card.get` | (`card_id`: `number`) => `Promise`<{}\> |
| `project.card.move` | (`card_id`: `number`, `column_id`: `number`) => `Promise`<``false`` \| `OctokitResponse`<{ `[key: string]`: `unknown`;  }, ``201``\>\> |
| `project.column` | { `get`: (`column_id`: `number`) => `Promise`<{}\> ; `list`: (`project_id`: `number`) => `Promise`<{}[]\> ; `listCards`: (`column_id`: `number`) => `Promise`<{}[]\>  } |
| `project.column.get` | (`column_id`: `number`) => `Promise`<{}\> |
| `project.column.list` | (`project_id`: `number`) => `Promise`<{}[]\> |
| `project.column.listCards` | (`column_id`: `number`) => `Promise`<{}[]\> |
| `project.projects` | { `get`: (`project_id`: `number`) => `Promise`<{}\> ; `org`: (`org`: `string`) => `Promise`<{}[]\> ; `repo`: (`owner`: `string`, `repo`: `string`) => `Promise`<{}[]\> ; `user`: (`user`: `string`) => `Promise`<{}[]\>  } |
| `project.projects.get` | (`project_id`: `number`) => `Promise`<{}\> |
| `project.projects.org` | (`org`: `string`) => `Promise`<{}[]\> |
| `project.projects.repo` | (`owner`: `string`, `repo`: `string`) => `Promise`<{}[]\> |
| `project.projects.user` | (`user`: `string`) => `Promise`<{}[]\> |
| `pullRequests` | { `changes`: (`additions`: `number`, `deletions`: `number`) => `Promise`<`number`\> ; `list`: (`IDNumber`: `number`) => `Promise`<`string`[]\> ; `reviews`: { `create`: (`IDNumber`: `number`, `body?`: `string`, `event?`: [`Event`](../#event), `comments?`: `any`) => `Promise`<`undefined` \| {}\> ; `dismiss`: (`IDNumber`: `number`, `review_id`: `number`, `message`: `string`) => `Promise`<`undefined` \| {}\> ; `isApproved`: (`reviews`: [`Reviews`](../#reviews)) => `Promise`<`number`\> ; `list`: (`IDNumber`: `number`) => `Promise`<{}[]\> ; `pending`: (`reviews`: `number`, `requested_reviews`: `number`) => `Promise`<`boolean`\> ; `requestReviewers`: (`IDNumber`: `number`, `reviewers`: `string`[]) => `Promise`<`undefined` \| {}\> ; `requestedChanges`: (`reviews`: [`Reviews`](../#reviews)) => `Promise`<`number`\> ; `update`: (`IDNumber`: `number`, `review_id`: `number`, `body`: `string`) => `Promise`<`undefined` \| {}\>  }  } |
| `pullRequests.changes` | (`additions`: `number`, `deletions`: `number`) => `Promise`<`number`\> |
| `pullRequests.list` | (`IDNumber`: `number`) => `Promise`<`string`[]\> |
| `pullRequests.reviews` | { `create`: (`IDNumber`: `number`, `body?`: `string`, `event?`: [`Event`](../#event), `comments?`: `any`) => `Promise`<`undefined` \| {}\> ; `dismiss`: (`IDNumber`: `number`, `review_id`: `number`, `message`: `string`) => `Promise`<`undefined` \| {}\> ; `isApproved`: (`reviews`: [`Reviews`](../#reviews)) => `Promise`<`number`\> ; `list`: (`IDNumber`: `number`) => `Promise`<{}[]\> ; `pending`: (`reviews`: `number`, `requested_reviews`: `number`) => `Promise`<`boolean`\> ; `requestReviewers`: (`IDNumber`: `number`, `reviewers`: `string`[]) => `Promise`<`undefined` \| {}\> ; `requestedChanges`: (`reviews`: [`Reviews`](../#reviews)) => `Promise`<`number`\> ; `update`: (`IDNumber`: `number`, `review_id`: `number`, `body`: `string`) => `Promise`<`undefined` \| {}\>  } |
| `pullRequests.reviews.create` | (`IDNumber`: `number`, `body?`: `string`, `event?`: [`Event`](../#event), `comments?`: `any`) => `Promise`<`undefined` \| {}\> |
| `pullRequests.reviews.dismiss` | (`IDNumber`: `number`, `review_id`: `number`, `message`: `string`) => `Promise`<`undefined` \| {}\> |
| `pullRequests.reviews.isApproved` | (`reviews`: [`Reviews`](../#reviews)) => `Promise`<`number`\> |
| `pullRequests.reviews.list` | (`IDNumber`: `number`) => `Promise`<{}[]\> |
| `pullRequests.reviews.pending` | (`reviews`: `number`, `requested_reviews`: `number`) => `Promise`<`boolean`\> |
| `pullRequests.reviews.requestReviewers` | (`IDNumber`: `number`, `reviewers`: `string`[]) => `Promise`<`undefined` \| {}\> |
| `pullRequests.reviews.requestedChanges` | (`reviews`: [`Reviews`](../#reviews)) => `Promise`<`number`\> |
| `pullRequests.reviews.update` | (`IDNumber`: `number`, `review_id`: `number`, `body`: `string`) => `Promise`<`undefined` \| {}\> |
| `tags` | { `get`: () => `Promise`<[`Tags`](../#tags)\>  } |
| `tags.get` | () => `Promise`<[`Tags`](../#tags)\> |

#### Defined in

[src/utils/index.ts:44](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/utils/index.ts#L44)

___

### client

• **client**: `Octokit` & `Api` & {}

#### Defined in

[src/utils/index.ts:18](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/utils/index.ts#L18)

___

### dryRun

• **dryRun**: `boolean`

#### Defined in

[src/utils/index.ts:20](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/utils/index.ts#L20)

___

### git

• **git**: `SimpleGit`

#### Defined in

[src/utils/index.ts:23](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/utils/index.ts#L23)

___

### labels

• **labels**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `addRemove` | (`labelName`: `string`, `IDNumber`: `number`, `hasLabel`: `boolean`, `shouldHaveLabel`: `boolean`) => `Promise`<`void`\> |
| `sync` | (`config`: `undefined` \| [`Labels`](../interfaces/Labels.md)) => `Promise`<`void`\> |

#### Defined in

[src/utils/index.ts:170](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/utils/index.ts#L170)

___

### parsingData

• **parsingData**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `formatColor` | (`color`: `string`) => `Promise`<`string`\> |
| `labels` | (`labels`: `any`) => `Promise`<`undefined` \| [`Labels`](../interfaces/Labels.md)\> |
| `normalize` | (`text`: `string`) => `Promise`<`string`\> |
| `processRegExpcondition` | (`condition`: `string`) => `Promise`<`RegExp`\> |

#### Defined in

[src/utils/index.ts:187](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/utils/index.ts#L187)

___

### ref

• `Optional` **ref**: `string`

#### Defined in

[src/utils/index.ts:22](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/utils/index.ts#L22)

___

### repo

• **repo**: [`Repo`](../interfaces/Repo.md)

#### Defined in

[src/utils/index.ts:19](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/utils/index.ts#L19)

___

### skipDelete

• **skipDelete**: `boolean`

#### Defined in

[src/utils/index.ts:21](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/utils/index.ts#L21)

___

### versioning

• **versioning**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `parse` | (`config`: [`Config`](../interfaces/Config.md), `ref?`: `string`) => `Promise`<[`Version`](../interfaces/Version.md)\> |

#### Defined in

[src/utils/index.ts:208](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/utils/index.ts#L208)

## Methods

### respond

▸ **respond**(`that`, `success`, `__namedParameters`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `that` | [`UtilThis`](../#utilthis) |
| `success` | `boolean` |
| `__namedParameters` | `Object` |
| `__namedParameters.body?` | `string` |
| `__namedParameters.event?` | [`Event`](../#event) |
| `__namedParameters.previousComment?` | `number` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/utils/index.ts:195](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/utils/index.ts#L195)

___

### shouldRun

▸ **shouldRun**(`_type`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `_type` | [`functionality`](../#functionality) |

#### Returns

`boolean`

#### Defined in

[src/utils/index.ts:213](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/utils/index.ts#L213)
