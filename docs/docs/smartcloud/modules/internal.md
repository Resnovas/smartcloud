---
id: "internal"
title: "Module: internal"
sidebar_label: "internal"
sidebar_position: 0
custom_edit_url: null
---

## Classes

- [Contexts](../classes/internal.Contexts.md)

## Interfaces

- [AbanondedConfig](../interfaces/internal.AbanondedConfig.md)
- [AssignProject](../interfaces/internal.AssignProject.md)
- [AutomaticApprove](../interfaces/internal.AutomaticApprove.md)
- [Changelog](../interfaces/internal.Changelog.md)
- [ConditionAnd](../interfaces/internal.ConditionAnd.md)
- [ConditionBranchMatches](../interfaces/internal.ConditionBranchMatches.md)
- [ConditionChangesSize](../interfaces/internal.ConditionChangesSize.md)
- [ConditionCreatorMatches](../interfaces/internal.ConditionCreatorMatches.md)
- [ConditionDescriptionMatches](../interfaces/internal.ConditionDescriptionMatches.md)
- [ConditionFilesMatch](../interfaces/internal.ConditionFilesMatch.md)
- [ConditionHasLabel](../interfaces/internal.ConditionHasLabel.md)
- [ConditionIsAbandoned](../interfaces/internal.ConditionIsAbandoned.md)
- [ConditionIsDraft](../interfaces/internal.ConditionIsDraft.md)
- [ConditionIsOpen](../interfaces/internal.ConditionIsOpen.md)
- [ConditionIsStale](../interfaces/internal.ConditionIsStale.md)
- [ConditionNot](../interfaces/internal.ConditionNot.md)
- [ConditionOnlyOne](../interfaces/internal.ConditionOnlyOne.md)
- [ConditionOr](../interfaces/internal.ConditionOr.md)
- [ConditionPendingReview](../interfaces/internal.ConditionPendingReview.md)
- [ConditionRequestedChanges](../interfaces/internal.ConditionRequestedChanges.md)
- [ConditionTitleMatches](../interfaces/internal.ConditionTitleMatches.md)
- [ConditionisApproved](../interfaces/internal.ConditionisApproved.md)
- [ConditiononColumn](../interfaces/internal.ConditiononColumn.md)
- [CreateBranch](../interfaces/internal.CreateBranch.md)
- [CreateMilestone](../interfaces/internal.CreateMilestone.md)
- [CreateRelease](../interfaces/internal.CreateRelease.md)
- [EnforceConventions](../interfaces/internal.EnforceConventions.md)
- [ExProjects](../interfaces/internal.ExProjects.md)
- [GeneralContext](../interfaces/internal.GeneralContext.md)
- [Group](../interfaces/internal.Group.md)
- [Milestones](../interfaces/internal.Milestones.md)
- [ProjectCreateBranch](../interfaces/internal.ProjectCreateBranch.md)
- [Props](../interfaces/internal.Props.md)
- [Release](../interfaces/internal.Release.md)
- [ReleaseChanges](../interfaces/internal.ReleaseChanges.md)
- [RequestApprovals](../interfaces/internal.RequestApprovals.md)
- [Sections](../interfaces/internal.Sections.md)
- [SharedConventionsConfig](../interfaces/internal.SharedConventionsConfig.md)
- [Stale](../interfaces/internal.Stale.md)
- [StaleConfig](../interfaces/internal.StaleConfig.md)
- [SyncRemote](../interfaces/internal.SyncRemote.md)
- [localCard](../interfaces/internal.localCard.md)
- [localColumn](../interfaces/internal.localColumn.md)

## Type Aliases

### Column

Ƭ **Column**: `string` \| `number`

The enforce conventions configuration

#### Defined in

[src/contexts/methods/conventions.ts:15](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/conventions.ts#L15)

## Functions

### CreateBranch

▸ **CreateBranch**(`this`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `this` | [`Issues`](../classes/Issues.md) |

#### Returns

`void`

#### Defined in

[src/contexts/methods/createBranch.ts:38](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/createBranch.ts#L38)
