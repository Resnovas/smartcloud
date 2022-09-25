---
id: "internal.Changelog"
title: "Interface: Changelog"
sidebar_label: "Changelog"
custom_edit_url: null
---

[internal](../modules/internal.md).Changelog

Changelog

## Hierarchy

- [`ReleaseChanges`](internal.ReleaseChanges.md)

  ↳ **`Changelog`**

## Properties

### body

• `Optional` **body**: `string`

The changelog body (before the sections)

#### Defined in

[src/contexts/methods/changelog.ts:15](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/changelog.ts#L15)

___

### includeIssues

• `Optional` **includeIssues**: `boolean`

Should include issues?

#### Inherited from

[ReleaseChanges](internal.ReleaseChanges.md).[includeIssues](internal.ReleaseChanges.md#includeissues)

#### Defined in

[src/contexts/methods/release.ts:69](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/release.ts#L69)

___

### sections

• `Optional` **sections**: [`Sections`](internal.Sections.md)[]

The section configuration

#### Inherited from

[ReleaseChanges](internal.ReleaseChanges.md).[sections](internal.ReleaseChanges.md#sections)

#### Defined in

[src/contexts/methods/release.ts:73](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/release.ts#L73)

___

### title

• `Optional` **title**: `string`

The changelog title

#### Defined in

[src/contexts/methods/changelog.ts:10](https://github.com/Resnovas/smartcloud/blob/b9e22a9/src/contexts/methods/changelog.ts#L10)
