# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

#### [0.0.1-15](https://gitlab.com/tgtmedialtd/smartcloud/core/compare/v0.0.1-14...v0.0.1-15) \(2020-01-05\)

#### Features

* **startup:** Start the application added \(lerna being wierd and causing issues\) \([7e76beb](https://gitlab.com/tgtmedialtd/smartcloud/core/commit/7e76bebb97a04b40cc450a8687795f950512312c)\)

#### Bug Fixes

* **submodule:** git's being a dick xD \([4475b91](https://gitlab.com/tgtmedialtd/smartcloud/core/commit/4475b911dd2279bc1054e855600f0eeb258ee39b)\)
* **submodule:** submodule core \([eb65fd4](https://gitlab.com/tgtmedialtd/smartcloud/core/commit/eb65fd4f2bbc2650c93f4529b6ae9e1e0542e666)\)
* **submodule:** submodule installation \([30d6857](https://gitlab.com/tgtmedialtd/smartcloud/core/commit/30d6857b0fa6d58d0133736b3ff958416733bbab)\)
* **submodules:** fixed submodules \([7613403](https://gitlab.com/tgtmedialtd/smartcloud/core/commit/7613403d9af08a31b2d687b20570febdb6750b8b)\)

#### 0.0.1-14 \(2020-01-03\)

#### Bug Fixes

* moved startup out of subdirectory \([46c0bdf](https://gitlab.com/tgtmedialtd/smartcloud/core/commit/46c0bdf8b360410a1797c23fc6b296907a95441a)\)

#### \[0.0.1-1\] \(2020-01-03\)

#### 0.0.1-0 \(2020-01-03\)







## Pre-Standard Version changelog:

**\[0.0.0-12\]**

* **TODO**
  * WordPress Integration
  * Google Authentication Integration
  * JWT integration
* **Added**
  * Sub Modules
  * Gulp
  * ../install/ - Install Scripts
  * ./extensions/discord/global/commands/commands - Command List Auto-generation
  * ./extensions/discord/global/commands/help - Help Command
  * ./extensions/discord/global/commands/global - Global Command
  * ./extensions/discord/init - to manage discord bot sharding
* **Changed**
  * ./extensions/discord/discord - renamed bot
  * ./extensions/discord/bot - Command Loading updated for dynamic help loading
  * ./classes/base - Module loading updated to be dynamic
  * ./functions/core - Moved into ./classes/base && ./classes/extensions
* **Fixed**
  * ./extensions/discord/global/events/message - PM Messages fatal
  * ./extensions/discord/global/events/ready - Config Referencing
  * ./classes/base - License referencing Issues
  * ./\*\* - Minor Spelling Errors
* **Broken**
  * Nothing
* **Security**
  * Nothing
* **Deprecated**
  * ./helpers/config - Configs moved to ./extensions/{extension}/
* **Removed**
  * ./classes/base - Redundant require removed

**\[0.0.0-11\]**

* **Added**
  * Dialogflow API
* **Changed**
  * ./base.ts
    * Added database to core
    * Corrected some typos
    * Version retrieved from ./package now
    * API uses headers
    * Sentry updates to work better
* **Fixed**
  * Database
  * Starts without needing core to be defined
  * Fix discord import modules
  * Line 65
  * Error: Cannot find module './extentions/discord/global/events/ready.js'
  * Fix event.bind does not exist
  * Fix core import into API
* **Broken**
  * Nothing
* **Security**
  * Nothing
* **Deprecated**
  * Nothing
* **Removed**
  * Nothing

**\[0.0.0-10\] - 2019-02-28**

* **Added**
  * ./classes/user - User class to get user information
  * ./classes/ping - Ping class to get server information and status
  * ./routes/ping - Ping the servers through the API
* **Changed**
  * Global restyling for JSDOC support
  * ./base
    * "const core" CHANGED TO "class Core"
    * Added user classes
    * Added JSDOC support
  * ./routes/api
    * API Updates
  * ./routes/core
    * Changed to class
  * ./routes/google
    * Changed to class
  * ./routes/errors
    * Changed to class
* **Fixed**
  * Classes
* **Broken**
  * Discord
  * Database
* **Removed**
  * ./classes/all

**\[0.0.0-9\] - 2019-01-31**

* **Added**
  * ./src/extentions/discord replaces ./src/functions/discord
  * ./src/routes/api - API Functionality
  * ./src/routes/errors - API Errors
  * ./src/routes/core/actions - API Core Actions
  * ./src/routes/google/actions - API Google Actions
* **Changed**
  * ./src/helpers/config -- Cleaned and updated to server better
  * ./src/base - API added & core fixes
  * ./src/extentions/discord -- updated to load all actions, commands and events
  * ./src/functions/database -- added database functionality
* **Removed**
  * ./src/functions/discord

**\[0.0.0-8\] - 2019-01-17**

* **Added**
  * ./functions/discord.ts -- Discord Functions have been moved to a new file and imported
  * ./functions/database.ts -- Database Functions have been moved to a new file
  * ./functions/core.ts -- moved core functionality out of base file
* **Changed**
  * ./core -- updated functions and definitions
  * ./helpers/config -- updated to work with new function design
* **Removed**
* ./helpers/loaders.ts

**\[0.0.0-7\] - 2019-01-16**

* **Added**
  * TypeScript raw code -- We switched development code
* **Changed**
  * All files -- We switched development code
* **Removed**
  * ALL JS RAW CODE -- We switched development code

**\[0.0.0-6\] - 2018-11-06**

* **Added**
  * CONTRIBUTING -- Explanation how to contribute to this program
  * CLA - Individual Contributor License Agreement
  * commands/global -- To allow for commands to be globalised
* **Changed**
  * app
  * config
  * commands/ping
  * events/ready
* **Removed**
  * commands/announce
  * commands/reload
  * commands/database

**\[0.0.0-5\] - 2018-11-01**

* **Added**
  * Initial Commit to BackLog
  * This CHANGELOG file to hopefully serve as an evolving example of a standardized open source project CHANGELOG.

