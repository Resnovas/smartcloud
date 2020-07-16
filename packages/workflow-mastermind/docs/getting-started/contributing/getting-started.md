# Getting Started

We want everyone to enjoy contributing to this project without needing to go through too much hassle, so we have defined three different types of contributing and how you go about doing each of them.

#### Understanding Our Versioning

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html), however for contributors we require additional information to be inserted into the versioning data, this helps us track what has been worked on in each version.

The following is our specific contribution versioning breakdown:

> Version format: Major.Minor.Patch.DEV-PATCH.TYPE-NAME
>
> Version example: 0.5.2-23

**DEV-PATCH**

The Dev build represents our development build. This build will be unstable and contain many contributors patches. Don't worry if your version doesn't always match the latest version of this, it changes often and is mainly used for small patches. If a significant feature is added, updated or changed. The corresponding version will be announced.

**TYPE-NAME**

The _type_ explains where the changes have taken place within the contributors code. You can choose from the following types:

* FEATURE
* MODULE
* BUG
* COMPATABILITY
* MINOR

The _Name_ is the name of the feature you have changed. In the example we have changed the feature `command/global.js`, therefore we named this patch `FEATURE-GLOBAL`.

_Contributors are not expected to include all the names, that's just silly. Just include the name of the biggest change. So if in the file `global.js` you changed 200 lines of code and you had to change 20 lines in `something.js` to make it work, then just use `GLOBAL`._

