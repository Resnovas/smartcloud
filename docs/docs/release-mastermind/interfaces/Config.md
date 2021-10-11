---
id: "Config"
title: "Interface: Config"
sidebar_label: "Config"
sidebar_position: 0
custom_edit_url: null
---

<!-- @format -->

## Properties

### issue

• `Optional` **issue**: [`IssueConfig`](IssueConfig.md)

The issue configurations.

#### Defined in

[action.ts:87](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L87)

---

### pr

• `Optional` **pr**: [`PullRequestConfig`](PullRequestConfig.md)

The pull request configurations.

#### Defined in

[action.ts:83](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L83)

---

### project

• `Optional` **project**: [`ProjectConfig`](ProjectConfig.md)

The project configurations.

#### Defined in

[action.ts:91](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L91)

---

### retryLimit

• `Optional` **retryLimit**: `number`

Maximum number of attempts before stopping.

**`default`** 3

#### Defined in

[action.ts:68](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L68)

---

### root

• `Optional` **root**: `string`

The root branch used to check configuration settings against.

#### Defined in

[action.ts:46](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L46)

---

### schedule

• `Optional` **schedule**: [`SharedConfig`](SharedConfig.md)

The schedule configurations.

#### Defined in

[action.ts:95](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L95)

---

### sharedConfig

• `Optional` **sharedConfig**: [`SharedConfig`](SharedConfig.md)

Shared configurations, merged with the PR, Issue, Project and Schedule configurations.

#### Defined in

[action.ts:79](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L79)

---

### versioning

• `Optional` **versioning**: `Object`

Versioning configuration used for release management.

#### Type declaration

| Name              | Type       | Description                                                   |
| :---------------- | :--------- | :------------------------------------------------------------ |
| `prereleaseName?` | `string`   | If version is a pre-release, this is the version name to use. |
| `source`          | `string`   | Version source used to determine the version.                 |
| `type?`           | `"SemVer"` | Version Type to change how versioning is handled.             |

#### Defined in

[action.ts:50](https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L50)
