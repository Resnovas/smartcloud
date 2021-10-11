---
id: "modules"
title: "@videndum/release-mastermind"
sidebar_label: "Exports"
sidebar_position: 0.5
custom_edit_url: null
---

<!-- @format -->

## Interfaces

- [ApiProps](interfaces/ApiProps.md)
- [Config](interfaces/Config.md)
- [IssueConditionConfig](interfaces/IssueConditionConfig.md)
- [IssueConfig](interfaces/IssueConfig.md)
- [Label](interfaces/Label.md)
- [Labels](interfaces/Labels.md)
- [Options](interfaces/Options.md)
- [PRConditionConfig](interfaces/PRConditionConfig.md)
- [ProjectConditionConfig](interfaces/ProjectConditionConfig.md)
- [ProjectConfig](interfaces/ProjectConfig.md)
- [PullRequestConfig](interfaces/PullRequestConfig.md)
- [Repo](interfaces/Repo.md)
- [Runners](interfaces/Runners.md)
- [ScheduleConditionConfig](interfaces/ScheduleConditionConfig.md)
- [SharedConditions](interfaces/SharedConditions.md)
- [SharedConfig](interfaces/SharedConfig.md)
- [SharedConventionConditions](interfaces/SharedConventionConditions.md)

## Type aliases

### Event

Ƭ **Event**: `"REQUEST_CHANGES"` \| `"APPROVE"` \| `"COMMENT"`

#### Defined in

[utils/index.ts:215](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/utils/index.ts#L215)

---

### IssueCondition

Ƭ **IssueCondition**: `Condition`

#### Defined in

[conditions/issue/index.ts:6](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/conditions/issue/index.ts#L6)

---

### PRCondition

Ƭ **PRCondition**: `Condition` \| `ConditionBranchMatches` \| `ConditionFilesMatch` \| `ConditionIsDraft` \| `ConditionChangesSize` \| `ConditionPendingReview` \| `ConditionRequestedChanges` \| `ConditionisApproved`

#### Defined in

[conditions/pr/index.ts:13](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/conditions/pr/index.ts#L13)

---

### ProjectCondition

Ƭ **ProjectCondition**: `Condition` \| `ConditiononColumn`

#### Defined in

[conditions/project/index.ts:7](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/conditions/project/index.ts#L7)

---

### ScheduleCondition

Ƭ **ScheduleCondition**: `Condition`

#### Defined in

conditions/schedule/index.ts:6

---

### ScheduleConfig

Ƭ **ScheduleConfig**: [`SharedConfig`](interfaces/SharedConfig.md)

The schedule configuration

#### Defined in

contexts/schedule.ts:15

---

### Tags

Ƭ **Tags**: `string`[]

#### Defined in

[utils/index.ts:216](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/utils/index.ts#L216)

---

### VersionSource

Ƭ **VersionSource**: `"node"` \| `"milestones"` \| `string`

The version source.
Node: A node project, our package will use the package.json to determine the version.
Milestones: Utilises the Github Milestone API to determine the version.
String: A string to use as the version.

#### Defined in

[action.ts:174](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L174)

---

### VersionType

Ƭ **VersionType**: `"SemVer"`

The version number type. This is used to determine how versioning is handled. SemVer is the default.

#### Defined in

[action.ts:179](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L179)

---

### functionality

Ƭ **functionality**: `"release"` \| `"convention"` \| `"label"`

#### Defined in

[utils/index.ts:208](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/utils/index.ts#L208)

---

### packages

Ƭ **packages**: `"@videndum/release-mastermind"` \| `"@videndum/label-mastermind"` \| `"@videndum/convention-mastermind"` \| `undefined`

#### Defined in

[utils/index.ts:209](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/utils/index.ts#L209)
