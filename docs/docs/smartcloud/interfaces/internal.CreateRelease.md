---
id: "internal.CreateRelease"
title: "Interface: CreateRelease"
sidebar_label: "CreateRelease"
custom_edit_url: null
---

[internal](../modules/internal.md).CreateRelease

The create release configuration

## Hierarchy

- [`ReleaseChanges`](internal.ReleaseChanges.md)

  ↳ **`CreateRelease`**

## Properties

### draft

• `Optional` **draft**: `boolean`

Should be a draft?

#### Defined in

[src/contexts/methods/release.ts:133](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/release.ts#L133)

___

### includeIssues

• `Optional` **includeIssues**: `boolean`

Should include issues?

#### Inherited from

[ReleaseChanges](internal.ReleaseChanges.md).[includeIssues](internal.ReleaseChanges.md#includeissues)

#### Defined in

[src/contexts/methods/release.ts:69](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/release.ts#L69)

___

### prerelease

• `Optional` **prerelease**: `boolean`

Should release be a prerelease?

#### Defined in

[src/contexts/methods/release.ts:137](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/release.ts#L137)

___

### releaseName

• `Optional` **releaseName**: `string`

The name of the release to create

#### Defined in

[src/contexts/methods/release.ts:121](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/release.ts#L121)

___

### releaseNamePrefix

• `Optional` **releaseNamePrefix**: `string`

The prefix before the releaseName

#### Defined in

[src/contexts/methods/release.ts:125](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/release.ts#L125)

___

### releaseNameSuffix

• `Optional` **releaseNameSuffix**: `string`

The sufix to add to the release name

#### Defined in

[src/contexts/methods/release.ts:129](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/release.ts#L129)

___

### sections

• `Optional` **sections**: [`Sections`](internal.Sections.md)[]

The section configuration

#### Inherited from

[ReleaseChanges](internal.ReleaseChanges.md).[sections](internal.ReleaseChanges.md#sections)

#### Defined in

[src/contexts/methods/release.ts:73](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/release.ts#L73)

___

### tagName

• `Optional` **tagName**: `string`

The name of the tag to create

#### Defined in

[src/contexts/methods/release.ts:113](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/release.ts#L113)

___

### tagPrefix

• `Optional` **tagPrefix**: `string`

The prefix before the tagName

#### Defined in

[src/contexts/methods/release.ts:117](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/release.ts#L117)

___

### useChangelog

• `Optional` **useChangelog**: `boolean`

Should the release use the generated changelog?

#### Defined in

[src/contexts/methods/release.ts:141](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/release.ts#L141)
