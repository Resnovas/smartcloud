---
id: "index"
title: "@resnovas/smartcloud"
sidebar_label: "Exports"
sidebar_position: 0.5
custom_edit_url: null
---

## Modules

- [internal](modules/internal.md)

## Classes

- [Issues](classes/Issues.md)
- [Project](classes/Project.md)
- [PullRequests](classes/PullRequests.md)
- [Schedule](classes/Schedule.md)
- [Utils](classes/Utils.md)

## Interfaces

- [ApiProps](interfaces/ApiProps.md)
- [Config](interfaces/Config.md)
- [IssueConditionConfig](interfaces/IssueConditionConfig.md)
- [IssueConfig](interfaces/IssueConfig.md)
- [IssueContext](interfaces/IssueContext.md)
- [Label](interfaces/Label.md)
- [Labels](interfaces/Labels.md)
- [Options](interfaces/Options.md)
- [PRConditionConfig](interfaces/PRConditionConfig.md)
- [PRContext](interfaces/PRContext.md)
- [PRProps](interfaces/PRProps.md)
- [ProjectConditionConfig](interfaces/ProjectConditionConfig.md)
- [ProjectConfig](interfaces/ProjectConfig.md)
- [ProjectContext](interfaces/ProjectContext.md)
- [ProjectProps](interfaces/ProjectProps.md)
- [PullRequestConfig](interfaces/PullRequestConfig.md)
- [Repo](interfaces/Repo.md)
- [Review](interfaces/Review.md)
- [Runners](interfaces/Runners.md)
- [ScheduleConditionConfig](interfaces/ScheduleConditionConfig.md)
- [ScheduleContext](interfaces/ScheduleContext.md)
- [SharedConditions](interfaces/SharedConditions.md)
- [SharedConfig](interfaces/SharedConfig.md)
- [SharedConventionConditions](interfaces/SharedConventionConditions.md)
- [Version](interfaces/Version.md)

## Type Aliases

### Condition

Ƭ **Condition**: [`ConditionCreatorMatches`](interfaces/internal.ConditionCreatorMatches.md) \| [`ConditionDescriptionMatches`](interfaces/internal.ConditionDescriptionMatches.md) \| [`ConditionIsOpen`](interfaces/internal.ConditionIsOpen.md) \| [`ConditionTitleMatches`](interfaces/internal.ConditionTitleMatches.md) \| [`ConditionHasLabel`](interfaces/internal.ConditionHasLabel.md) \| [`ConditionIsStale`](interfaces/internal.ConditionIsStale.md) \| [`ConditionIsAbandoned`](interfaces/internal.ConditionIsAbandoned.md) \| [`ConditionOr`](interfaces/internal.ConditionOr.md) \| [`ConditionAnd`](interfaces/internal.ConditionAnd.md) \| [`ConditionNot`](interfaces/internal.ConditionNot.md) \| [`ConditionOnlyOne`](interfaces/internal.ConditionOnlyOne.md)

#### Defined in

[src/conditions/util/index.ts:18](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/conditions/util/index.ts#L18)

___

### CurContext

Ƭ **CurContext**: { `context`: [`PRContext`](interfaces/PRContext.md) ; `type`: ``"pr"``  } \| { `context`: [`IssueContext`](interfaces/IssueContext.md) ; `type`: ``"issue"``  } \| { `context`: [`ProjectContext`](interfaces/ProjectContext.md) ; `type`: ``"project"``  } \| { `context`: [`ScheduleContext`](interfaces/ScheduleContext.md) ; `type`: ``"schedule"``  }

#### Defined in

[src/conditions/index.ts:18](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/conditions/index.ts#L18)

___

### Event

Ƭ **Event**: ``"REQUEST_CHANGES"`` \| ``"APPROVE"`` \| ``"COMMENT"``

#### Defined in

[src/utils/index.ts:247](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/utils/index.ts#L247)

___

### Github

Ƭ **Github**: `InstanceType`<typeof `GitHub`\>

#### Defined in

[src/action.ts:183](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/action.ts#L183)

___

### IssueCondition

Ƭ **IssueCondition**: [`Condition`](#condition)

#### Defined in

[src/conditions/issue/index.ts:6](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/conditions/issue/index.ts#L6)

___

### IssueProps

Ƭ **IssueProps**: [`Props`](interfaces/internal.Props.md)

#### Defined in

[src/conditions/index.ts:75](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/conditions/index.ts#L75)

___

### PRCondition

Ƭ **PRCondition**: [`Condition`](#condition) \| [`ConditionBranchMatches`](interfaces/internal.ConditionBranchMatches.md) \| [`ConditionFilesMatch`](interfaces/internal.ConditionFilesMatch.md) \| [`ConditionIsDraft`](interfaces/internal.ConditionIsDraft.md) \| [`ConditionChangesSize`](interfaces/internal.ConditionChangesSize.md) \| [`ConditionPendingReview`](interfaces/internal.ConditionPendingReview.md) \| [`ConditionRequestedChanges`](interfaces/internal.ConditionRequestedChanges.md) \| [`ConditionisApproved`](interfaces/internal.ConditionisApproved.md)

#### Defined in

[src/conditions/pr/index.ts:13](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/conditions/pr/index.ts#L13)

___

### ProjectCondition

Ƭ **ProjectCondition**: [`Condition`](#condition) \| [`ConditiononColumn`](interfaces/internal.ConditiononColumn.md)

#### Defined in

[src/conditions/project/index.ts:7](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/conditions/project/index.ts#L7)

___

### Reviews

Ƭ **Reviews**: [`Review`](interfaces/Review.md)[]

#### Defined in

[src/conditions/index.ts:106](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/conditions/index.ts#L106)

___

### ScheduleCondition

Ƭ **ScheduleCondition**: [`Condition`](#condition)

#### Defined in

[src/conditions/schedule/index.ts:6](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/conditions/schedule/index.ts#L6)

___

### ScheduleConfig

Ƭ **ScheduleConfig**: [`SharedConfig`](interfaces/SharedConfig.md)

The schedule configuration

#### Defined in

[src/contexts/schedule.ts:15](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/contexts/schedule.ts#L15)

___

### ScheduleProps

Ƭ **ScheduleProps**: [`Props`](interfaces/internal.Props.md)

#### Defined in

[src/conditions/index.ts:91](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/conditions/index.ts#L91)

___

### SharedConfigIndex

Ƭ `Private` **SharedConfigIndex**: ``"ref"`` \| ``"enforceConventions"`` \| ``"labels"`` \| ``"stale"``

The shared configuration Index

#### Defined in

[src/action.ts:104](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/action.ts#L104)

___

### Tags

Ƭ **Tags**: `string`[]

#### Defined in

[src/utils/index.ts:248](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/utils/index.ts#L248)

___

### UtilProps

Ƭ **UtilProps**: [`IssueProps`](#issueprops) \| [`PRProps`](interfaces/PRProps.md) \| [`ProjectProps`](interfaces/ProjectProps.md) \| [`ScheduleProps`](#scheduleprops)

Props used instead of manually requiring props

#### Defined in

[src/conditions/index.ts:155](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/conditions/index.ts#L155)

___

### UtilThis

Ƭ **UtilThis**: [`Issues`](classes/Issues.md) \| [`PullRequests`](classes/PullRequests.md) \| [`Project`](classes/Project.md) \| [`Schedule`](classes/Schedule.md)

This instead of manually requiring this

#### Defined in

[src/conditions/index.ts:151](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/conditions/index.ts#L151)

___

### VersionSource

Ƭ **VersionSource**: ``"node"`` \| ``"milestones"`` \| `string`

The version source.
Node: A node project, our package will use the package.json to determine the version.
Milestones: Utilises the Github Milestone API to determine the version.
String: A string to use as the version.

#### Defined in

[src/action.ts:176](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/action.ts#L176)

___

### VersionType

Ƭ **VersionType**: ``"SemVer"``

The version number type. This is used to determine how versioning is handled. SemVer is the default.

#### Defined in

[src/action.ts:181](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/action.ts#L181)

___

### functionality

Ƭ **functionality**: ``"release"`` \| ``"convention"`` \| ``"label"``

#### Defined in

[src/utils/index.ts:240](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/utils/index.ts#L240)

___

### packages

Ƭ **packages**: ``"@resnovas/smartcloud"`` \| ``"@resnovas/label-mastermind"`` \| ``"@resnovas/convention-mastermind"`` \| `undefined`

#### Defined in

[src/utils/index.ts:241](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/utils/index.ts#L241)

## Variables

### handlers

• `Const` **handlers**: (readonly [``"creatorMatches"``, (`this`: [`UtilThis`](#utilthis), `pattern`: [`ConditionCreatorMatches`](interfaces/internal.ConditionCreatorMatches.md), `issue`: [`UtilProps`](#utilprops)) => `Promise`<`boolean`\>] \| readonly [``"descriptionMatches"``, (`this`: [`UtilThis`](#utilthis), `pattern`: [`ConditionDescriptionMatches`](interfaces/internal.ConditionDescriptionMatches.md), `issue`: [`UtilProps`](#utilprops)) => `Promise`<`boolean`\>] \| readonly [``"isOpen"``, (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionIsOpen`](interfaces/internal.ConditionIsOpen.md), `issue`: [`UtilProps`](#utilprops)) => `boolean`] \| readonly [``"isStale"``, (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionIsStale`](interfaces/internal.ConditionIsStale.md), `issue`: [`UtilProps`](#utilprops)) => `boolean`] \| readonly [``"isAbandoned"``, (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionIsAbandoned`](interfaces/internal.ConditionIsAbandoned.md), `issue`: [`UtilProps`](#utilprops)) => `boolean`] \| readonly [``"hasLabel"``, (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionHasLabel`](interfaces/internal.ConditionHasLabel.md), `issue`: [`UtilProps`](#utilprops)) => `boolean`] \| readonly [``"titleMatches"``, (`this`: [`UtilThis`](#utilthis), `pattern`: [`ConditionTitleMatches`](interfaces/internal.ConditionTitleMatches.md), `issue`: [`UtilProps`](#utilprops)) => `Promise`<`boolean`\>] \| readonly [``"$and"``, (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionAnd`](interfaces/internal.ConditionAnd.md), `props`: [`UtilProps`](#utilprops)) => `boolean`] \| readonly [``"$or"``, (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionOr`](interfaces/internal.ConditionOr.md), `props`: [`UtilProps`](#utilprops)) => `boolean`] \| readonly [``"$not"``, (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionNot`](interfaces/internal.ConditionNot.md), `props`: [`UtilProps`](#utilprops)) => `boolean`] \| readonly [``"$only"``, (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionOnlyOne`](interfaces/internal.ConditionOnlyOne.md), `props`: [`UtilProps`](#utilprops)) => `boolean`])[]

The utility condition handler.

#### Defined in

[src/conditions/util/index.ts:34](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/conditions/util/index.ts#L34)

## Functions

### evaluator

▸ **evaluator**(`this`, `config`, `props`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `this` | [`UtilThis`](#utilthis) |
| `config` | [`SharedConventionsConfig`](interfaces/internal.SharedConventionsConfig.md) \| [`PRConditionConfig`](interfaces/PRConditionConfig.md) \| [`IssueConditionConfig`](interfaces/IssueConditionConfig.md) \| [`ProjectConditionConfig`](interfaces/ProjectConditionConfig.md) \| [`Release`](interfaces/internal.Release.md) |
| `props` | [`UtilProps`](#utilprops) |

#### Returns

`Promise`<`boolean`\>

#### Defined in

[src/evaluator.ts:42](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/evaluator.ts#L42)

___

### getIssueConditionHandler

▸ **getIssueConditionHandler**(`this`, `condition`): `undefined` \| (`this`: [`UtilThis`](#utilthis), `pattern`: [`ConditionCreatorMatches`](interfaces/internal.ConditionCreatorMatches.md), `issue`: [`UtilProps`](#utilprops)) => `Promise`<`boolean`\> \| (`this`: [`UtilThis`](#utilthis), `pattern`: [`ConditionDescriptionMatches`](interfaces/internal.ConditionDescriptionMatches.md), `issue`: [`UtilProps`](#utilprops)) => `Promise`<`boolean`\> \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionIsOpen`](interfaces/internal.ConditionIsOpen.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionIsStale`](interfaces/internal.ConditionIsStale.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionIsAbandoned`](interfaces/internal.ConditionIsAbandoned.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionHasLabel`](interfaces/internal.ConditionHasLabel.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `pattern`: [`ConditionTitleMatches`](interfaces/internal.ConditionTitleMatches.md), `issue`: [`UtilProps`](#utilprops)) => `Promise`<`boolean`\> \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionAnd`](interfaces/internal.ConditionAnd.md), `props`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionOr`](interfaces/internal.ConditionOr.md), `props`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionNot`](interfaces/internal.ConditionNot.md), `props`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionOnlyOne`](interfaces/internal.ConditionOnlyOne.md), `props`: [`UtilProps`](#utilprops)) => `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `this` | [`Issues`](classes/Issues.md) |
| `condition` | [`Condition`](#condition) |

#### Returns

`undefined` \| (`this`: [`UtilThis`](#utilthis), `pattern`: [`ConditionCreatorMatches`](interfaces/internal.ConditionCreatorMatches.md), `issue`: [`UtilProps`](#utilprops)) => `Promise`<`boolean`\> \| (`this`: [`UtilThis`](#utilthis), `pattern`: [`ConditionDescriptionMatches`](interfaces/internal.ConditionDescriptionMatches.md), `issue`: [`UtilProps`](#utilprops)) => `Promise`<`boolean`\> \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionIsOpen`](interfaces/internal.ConditionIsOpen.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionIsStale`](interfaces/internal.ConditionIsStale.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionIsAbandoned`](interfaces/internal.ConditionIsAbandoned.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionHasLabel`](interfaces/internal.ConditionHasLabel.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `pattern`: [`ConditionTitleMatches`](interfaces/internal.ConditionTitleMatches.md), `issue`: [`UtilProps`](#utilprops)) => `Promise`<`boolean`\> \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionAnd`](interfaces/internal.ConditionAnd.md), `props`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionOr`](interfaces/internal.ConditionOr.md), `props`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionNot`](interfaces/internal.ConditionNot.md), `props`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionOnlyOne`](interfaces/internal.ConditionOnlyOne.md), `props`: [`UtilProps`](#utilprops)) => `boolean`

#### Defined in

[src/conditions/issue/index.ts:10](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/conditions/issue/index.ts#L10)

___

### getPRConditionHandler

▸ **getPRConditionHandler**(`this`, `condition`): `undefined` \| (`this`: [`UtilThis`](#utilthis), `pattern`: [`ConditionCreatorMatches`](interfaces/internal.ConditionCreatorMatches.md), `issue`: [`UtilProps`](#utilprops)) => `Promise`<`boolean`\> \| (`this`: [`UtilThis`](#utilthis), `pattern`: [`ConditionDescriptionMatches`](interfaces/internal.ConditionDescriptionMatches.md), `issue`: [`UtilProps`](#utilprops)) => `Promise`<`boolean`\> \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionIsOpen`](interfaces/internal.ConditionIsOpen.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionIsStale`](interfaces/internal.ConditionIsStale.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionIsAbandoned`](interfaces/internal.ConditionIsAbandoned.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionHasLabel`](interfaces/internal.ConditionHasLabel.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `pattern`: [`ConditionTitleMatches`](interfaces/internal.ConditionTitleMatches.md), `issue`: [`UtilProps`](#utilprops)) => `Promise`<`boolean`\> \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionAnd`](interfaces/internal.ConditionAnd.md), `props`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionOr`](interfaces/internal.ConditionOr.md), `props`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionNot`](interfaces/internal.ConditionNot.md), `props`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionOnlyOne`](interfaces/internal.ConditionOnlyOne.md), `props`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`Issues`](classes/Issues.md) \| [`PullRequests`](classes/PullRequests.md) \| [`Project`](classes/Project.md), `pattern`: [`ConditionBranchMatches`](interfaces/internal.ConditionBranchMatches.md), `pr`: [`PRProps`](interfaces/PRProps.md)) => `Promise`<`boolean`\> \| (`this`: [`Issues`](classes/Issues.md) \| [`PullRequests`](classes/PullRequests.md) \| [`Project`](classes/Project.md), `condition`: [`ConditionFilesMatch`](interfaces/internal.ConditionFilesMatch.md), `pr`: [`PRProps`](interfaces/PRProps.md)) => `boolean` \| (`this`: [`Issues`](classes/Issues.md) \| [`PullRequests`](classes/PullRequests.md) \| [`Project`](classes/Project.md), `condition`: [`ConditionIsDraft`](interfaces/internal.ConditionIsDraft.md), `pr`: [`PRProps`](interfaces/PRProps.md)) => `boolean` \| (`this`: [`Issues`](classes/Issues.md) \| [`PullRequests`](classes/PullRequests.md) \| [`Project`](classes/Project.md), `condition`: [`ConditionChangesSize`](interfaces/internal.ConditionChangesSize.md), `pr`: [`PRProps`](interfaces/PRProps.md)) => `boolean` \| (`this`: [`Issues`](classes/Issues.md) \| [`PullRequests`](classes/PullRequests.md) \| [`Project`](classes/Project.md), `condition`: [`ConditionPendingReview`](interfaces/internal.ConditionPendingReview.md), `pr`: [`PRProps`](interfaces/PRProps.md)) => `boolean` \| (`this`: [`Issues`](classes/Issues.md) \| [`PullRequests`](classes/PullRequests.md) \| [`Project`](classes/Project.md), `condition`: [`ConditionRequestedChanges`](interfaces/internal.ConditionRequestedChanges.md), `pr`: [`PRProps`](interfaces/PRProps.md)) => `boolean` \| (`this`: [`Issues`](classes/Issues.md) \| [`PullRequests`](classes/PullRequests.md) \| [`Project`](classes/Project.md), `condition`: [`ConditionisApproved`](interfaces/internal.ConditionisApproved.md), `pr`: [`PRProps`](interfaces/PRProps.md)) => `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `this` | [`Issues`](classes/Issues.md) \| [`PullRequests`](classes/PullRequests.md) \| [`Project`](classes/Project.md) |
| `condition` | [`PRCondition`](#prcondition) |

#### Returns

`undefined` \| (`this`: [`UtilThis`](#utilthis), `pattern`: [`ConditionCreatorMatches`](interfaces/internal.ConditionCreatorMatches.md), `issue`: [`UtilProps`](#utilprops)) => `Promise`<`boolean`\> \| (`this`: [`UtilThis`](#utilthis), `pattern`: [`ConditionDescriptionMatches`](interfaces/internal.ConditionDescriptionMatches.md), `issue`: [`UtilProps`](#utilprops)) => `Promise`<`boolean`\> \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionIsOpen`](interfaces/internal.ConditionIsOpen.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionIsStale`](interfaces/internal.ConditionIsStale.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionIsAbandoned`](interfaces/internal.ConditionIsAbandoned.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionHasLabel`](interfaces/internal.ConditionHasLabel.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `pattern`: [`ConditionTitleMatches`](interfaces/internal.ConditionTitleMatches.md), `issue`: [`UtilProps`](#utilprops)) => `Promise`<`boolean`\> \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionAnd`](interfaces/internal.ConditionAnd.md), `props`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionOr`](interfaces/internal.ConditionOr.md), `props`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionNot`](interfaces/internal.ConditionNot.md), `props`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionOnlyOne`](interfaces/internal.ConditionOnlyOne.md), `props`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`Issues`](classes/Issues.md) \| [`PullRequests`](classes/PullRequests.md) \| [`Project`](classes/Project.md), `pattern`: [`ConditionBranchMatches`](interfaces/internal.ConditionBranchMatches.md), `pr`: [`PRProps`](interfaces/PRProps.md)) => `Promise`<`boolean`\> \| (`this`: [`Issues`](classes/Issues.md) \| [`PullRequests`](classes/PullRequests.md) \| [`Project`](classes/Project.md), `condition`: [`ConditionFilesMatch`](interfaces/internal.ConditionFilesMatch.md), `pr`: [`PRProps`](interfaces/PRProps.md)) => `boolean` \| (`this`: [`Issues`](classes/Issues.md) \| [`PullRequests`](classes/PullRequests.md) \| [`Project`](classes/Project.md), `condition`: [`ConditionIsDraft`](interfaces/internal.ConditionIsDraft.md), `pr`: [`PRProps`](interfaces/PRProps.md)) => `boolean` \| (`this`: [`Issues`](classes/Issues.md) \| [`PullRequests`](classes/PullRequests.md) \| [`Project`](classes/Project.md), `condition`: [`ConditionChangesSize`](interfaces/internal.ConditionChangesSize.md), `pr`: [`PRProps`](interfaces/PRProps.md)) => `boolean` \| (`this`: [`Issues`](classes/Issues.md) \| [`PullRequests`](classes/PullRequests.md) \| [`Project`](classes/Project.md), `condition`: [`ConditionPendingReview`](interfaces/internal.ConditionPendingReview.md), `pr`: [`PRProps`](interfaces/PRProps.md)) => `boolean` \| (`this`: [`Issues`](classes/Issues.md) \| [`PullRequests`](classes/PullRequests.md) \| [`Project`](classes/Project.md), `condition`: [`ConditionRequestedChanges`](interfaces/internal.ConditionRequestedChanges.md), `pr`: [`PRProps`](interfaces/PRProps.md)) => `boolean` \| (`this`: [`Issues`](classes/Issues.md) \| [`PullRequests`](classes/PullRequests.md) \| [`Project`](classes/Project.md), `condition`: [`ConditionisApproved`](interfaces/internal.ConditionisApproved.md), `pr`: [`PRProps`](interfaces/PRProps.md)) => `boolean`

#### Defined in

[src/conditions/pr/index.ts:34](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/conditions/pr/index.ts#L34)

___

### getProjectConditionHandler

▸ **getProjectConditionHandler**(`this`, `condition`): `undefined` \| (`this`: [`UtilThis`](#utilthis), `pattern`: [`ConditionCreatorMatches`](interfaces/internal.ConditionCreatorMatches.md), `issue`: [`UtilProps`](#utilprops)) => `Promise`<`boolean`\> \| (`this`: [`UtilThis`](#utilthis), `pattern`: [`ConditionDescriptionMatches`](interfaces/internal.ConditionDescriptionMatches.md), `issue`: [`UtilProps`](#utilprops)) => `Promise`<`boolean`\> \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionIsOpen`](interfaces/internal.ConditionIsOpen.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionIsStale`](interfaces/internal.ConditionIsStale.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionIsAbandoned`](interfaces/internal.ConditionIsAbandoned.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionHasLabel`](interfaces/internal.ConditionHasLabel.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `pattern`: [`ConditionTitleMatches`](interfaces/internal.ConditionTitleMatches.md), `issue`: [`UtilProps`](#utilprops)) => `Promise`<`boolean`\> \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionAnd`](interfaces/internal.ConditionAnd.md), `props`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionOr`](interfaces/internal.ConditionOr.md), `props`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionNot`](interfaces/internal.ConditionNot.md), `props`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionOnlyOne`](interfaces/internal.ConditionOnlyOne.md), `props`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`Issues`](classes/Issues.md) \| [`PullRequests`](classes/PullRequests.md) \| [`Project`](classes/Project.md), `condition`: [`ConditiononColumn`](interfaces/internal.ConditiononColumn.md), `pr`: [`ProjectProps`](interfaces/ProjectProps.md)) => `boolean`

The project condition handler.

#### Parameters

| Name | Type |
| :------ | :------ |
| `this` | [`Issues`](classes/Issues.md) \| [`PullRequests`](classes/PullRequests.md) \| [`Project`](classes/Project.md) |
| `condition` | [`ProjectCondition`](#projectcondition) |

#### Returns

`undefined` \| (`this`: [`UtilThis`](#utilthis), `pattern`: [`ConditionCreatorMatches`](interfaces/internal.ConditionCreatorMatches.md), `issue`: [`UtilProps`](#utilprops)) => `Promise`<`boolean`\> \| (`this`: [`UtilThis`](#utilthis), `pattern`: [`ConditionDescriptionMatches`](interfaces/internal.ConditionDescriptionMatches.md), `issue`: [`UtilProps`](#utilprops)) => `Promise`<`boolean`\> \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionIsOpen`](interfaces/internal.ConditionIsOpen.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionIsStale`](interfaces/internal.ConditionIsStale.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionIsAbandoned`](interfaces/internal.ConditionIsAbandoned.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionHasLabel`](interfaces/internal.ConditionHasLabel.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `pattern`: [`ConditionTitleMatches`](interfaces/internal.ConditionTitleMatches.md), `issue`: [`UtilProps`](#utilprops)) => `Promise`<`boolean`\> \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionAnd`](interfaces/internal.ConditionAnd.md), `props`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionOr`](interfaces/internal.ConditionOr.md), `props`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionNot`](interfaces/internal.ConditionNot.md), `props`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionOnlyOne`](interfaces/internal.ConditionOnlyOne.md), `props`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`Issues`](classes/Issues.md) \| [`PullRequests`](classes/PullRequests.md) \| [`Project`](classes/Project.md), `condition`: [`ConditiononColumn`](interfaces/internal.ConditiononColumn.md), `pr`: [`ProjectProps`](interfaces/ProjectProps.md)) => `boolean`

#### Defined in

[src/conditions/project/index.ts:14](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/conditions/project/index.ts#L14)

___

### getScheduleConditionHandler

▸ **getScheduleConditionHandler**(`this`, `condition`): `undefined` \| (`this`: [`UtilThis`](#utilthis), `pattern`: [`ConditionCreatorMatches`](interfaces/internal.ConditionCreatorMatches.md), `issue`: [`UtilProps`](#utilprops)) => `Promise`<`boolean`\> \| (`this`: [`UtilThis`](#utilthis), `pattern`: [`ConditionDescriptionMatches`](interfaces/internal.ConditionDescriptionMatches.md), `issue`: [`UtilProps`](#utilprops)) => `Promise`<`boolean`\> \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionIsOpen`](interfaces/internal.ConditionIsOpen.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionIsStale`](interfaces/internal.ConditionIsStale.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionIsAbandoned`](interfaces/internal.ConditionIsAbandoned.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionHasLabel`](interfaces/internal.ConditionHasLabel.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `pattern`: [`ConditionTitleMatches`](interfaces/internal.ConditionTitleMatches.md), `issue`: [`UtilProps`](#utilprops)) => `Promise`<`boolean`\> \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionAnd`](interfaces/internal.ConditionAnd.md), `props`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionOr`](interfaces/internal.ConditionOr.md), `props`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionNot`](interfaces/internal.ConditionNot.md), `props`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionOnlyOne`](interfaces/internal.ConditionOnlyOne.md), `props`: [`UtilProps`](#utilprops)) => `boolean`

The schedule condition handler.

#### Parameters

| Name | Type |
| :------ | :------ |
| `this` | [`Schedule`](classes/Schedule.md) |
| `condition` | [`Condition`](#condition) |

#### Returns

`undefined` \| (`this`: [`UtilThis`](#utilthis), `pattern`: [`ConditionCreatorMatches`](interfaces/internal.ConditionCreatorMatches.md), `issue`: [`UtilProps`](#utilprops)) => `Promise`<`boolean`\> \| (`this`: [`UtilThis`](#utilthis), `pattern`: [`ConditionDescriptionMatches`](interfaces/internal.ConditionDescriptionMatches.md), `issue`: [`UtilProps`](#utilprops)) => `Promise`<`boolean`\> \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionIsOpen`](interfaces/internal.ConditionIsOpen.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionIsStale`](interfaces/internal.ConditionIsStale.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionIsAbandoned`](interfaces/internal.ConditionIsAbandoned.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionHasLabel`](interfaces/internal.ConditionHasLabel.md), `issue`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `pattern`: [`ConditionTitleMatches`](interfaces/internal.ConditionTitleMatches.md), `issue`: [`UtilProps`](#utilprops)) => `Promise`<`boolean`\> \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionAnd`](interfaces/internal.ConditionAnd.md), `props`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionOr`](interfaces/internal.ConditionOr.md), `props`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionNot`](interfaces/internal.ConditionNot.md), `props`: [`UtilProps`](#utilprops)) => `boolean` \| (`this`: [`UtilThis`](#utilthis), `condition`: [`ConditionOnlyOne`](interfaces/internal.ConditionOnlyOne.md), `props`: [`UtilProps`](#utilprops)) => `boolean`

#### Defined in

[src/conditions/schedule/index.ts:13](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/conditions/schedule/index.ts#L13)

___

### log

▸ `Private` **log**(`name`, `message`, `options?`): `Promise`<`LogReturn`\>

Logging function used throught the package.

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `LoggingLevels` |
| `message` | `string` |
| `options?` | `LoggingOptions` |

#### Returns

`Promise`<`LogReturn`\>

#### Defined in

[src/index.ts:43](https://github.com/Resnovas/smartcloud/blob/b91f5b4/src/index.ts#L43)
