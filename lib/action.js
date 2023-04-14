"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: action.ts
 * Path: \src\action.ts
 * Created Date: Saturday, October 8th 2022
 * Author: Jonathan Stevens (Email: jonathan@resnovas.com, Github: https://github.com/TGTGamer)
 * -----
 * Contributing: Please read through our contributing guidelines. Included are directions for opening
 * issues, coding standards, and notes on development. These can be found at https://github.com/resnovas/smartcloud/CONTRIBUTING.md
 *
 * Code of Conduct: This project abides by the Contributor Covenant, version 2.0. Please interact in ways that contribute to an open,
 * welcoming, diverse, inclusive, and healthy community. Our Code of Conduct can be found at https://github.com/resnovas/smartcloud/CODE_OF_CONDUCT.md
 * -----
 * Copyright (c) 2022 Resnovas - All Rights Reserved
 * LICENSE: GNU General Public License v3.0 or later (GPL-3.0+)
 * -----
 * This program has been provided under confidence of the copyright holder and is
 * licensed for copying, distribution and modification under the terms of
 * the GNU General Public License v3.0 or later (GPL-3.0+) published as the License,
 * or (at your option) any later version of this license.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License v3.0 or later for more details.
 *
 * You should have received a copy of the GNU General Public License v3.0 or later
 * along with this program. If not, please write to: jonathan@resnovas.com,
 * or see https://www.gnu.org/licenses/gpl-3.0-standalone.html
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE - PLEASE SEE THE LICENSE FILE FOR DETAILS
 * -----
 * Last Modified: 24-10-2022
 * By: Jonathan Stevens (Email: jonathan@resnovas.com, Github: https://github.com/TGTGamer)
 * Current Version: 1.0.0-beta.0
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const node_fs_1 = tslib_1.__importDefault(require("node:fs"));
const node_process_1 = tslib_1.__importStar(require("node:process"));
const core = tslib_1.__importStar(require("@actions/core"));
const github_1 = require("@actions/github");
const index_js_1 = require("./contexts/index.js");
const index_js_2 = require("./utils/index.js");
const logging_js_1 = require("./logging.js");
const localEx = node_fs_1.default.existsSync((0, node_process_1.cwd)() + '/config.json');
let local;
let context = github_1.context;
class Action {
    constructor(client, options) {
        var _a;
        core.startGroup('Setup Phase');
        this.client = client;
        this.opts = options;
        this.dryRun = options.dryRun;
        this.configJson = options.configJson;
        this.configPath = options.configPath;
        this.configRef = options.configRef;
        this.fillEmpty = options.fillEmpty;
        this.ref = (_a = options.ref) !== null && _a !== void 0 ? _a : context.ref;
    }
    run() {
        var _a, _b, _c, _d;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (localEx) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
                // @ts-ignore
                local = yield Promise.resolve().then(() => tslib_1.__importStar(require('../config.json')));
                node_process_1.default.env.GITHUB_REPOSITORY = local.GITHUB_REPOSITORY;
                node_process_1.default.env.GITHUB_REPOSITORY_OWNER = local.GITHUB_REPOSITORY_OWNER;
                if (!context.payload.issue && !context.payload.pull_request) {
                    context = (yield Promise.resolve(`${local.github_context}`).then(s => tslib_1.__importStar(require(s))));
                }
            }
            this.repo = context.repo;
            if (this.dryRun) {
                if (this.opts.repo) {
                    this.repo = this.opts.repo;
                }
                if (!((_a = this.opts.repo) === null || _a === void 0 ? void 0 : _a.repo)) {
                    this.repo.repo = (_b = node_process_1.default.env.GITHUB_REPOSITORY) !== null && _b !== void 0 ? _b : 'Unknown';
                }
                if (!((_c = this.opts.repo) === null || _c === void 0 ? void 0 : _c.owner)) {
                    this.repo.owner = (_d = node_process_1.default.env.GITHUB_REPOSITORY_OWNER) !== null && _d !== void 0 ? _d : 'Unknown';
                }
            }
            this.util = new index_js_2.Utils({ client: this.client, repo: this.repo }, { dryRun: this.opts.dryRun, skipDelete: this.opts.skipDelete, ref: this.ref }, {
                git: this.opts.git,
            });
            (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, `Repo data: ${this.repo.owner}/${this.repo.repo}`);
            /**
             * Capture and log context to debug for Local Running
             * @author TGTGamer
             * @since 1.0.0
             */
            (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, `Context for local running. See readme.md for information on how to setup local running: ${JSON.stringify(context)}`);
            /**
             * Process the config
             * @author TGTGamer
             * @since 1.1.0
             */
            const configs = yield this.processConfig().catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                (0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while processing config: ' + String(error));
                throw error;
            }));
            if (!configs.runners[0]) {
                throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'No config data.'));
            }
            (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, `Config: ${JSON.stringify(configs)}`);
            if (configs.labels) {
                /**
                 * Syncronise the labels
                 * @author TGTGamer
                 * @since 1.1.0
                 */
                core.startGroup('label Actions');
                (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, 'Attempting to apply labels');
                yield this.syncLabels(configs).catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    (0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while syncronising labels: ' + String(error));
                    throw error;
                }));
                (0, logging_js_1.log)(logging_js_1.LoggingLevels.notice, 'Successfully applied all labels');
                core.endGroup();
            }
            // Run each release manager
            for (let config of configs.runners) {
                /**
                 * Convert label ID's to Names
                 * @author TGTGamer
                 * @since 1.1.0
                 */
                config.labels = this.configureLabels(configs);
                /**
                 * Get the context
                 * @author TGTGamer
                 * @since 1.1.0
                 */
                const curContext = yield this.processContext(config).catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    (0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while processing context: ' + String(error));
                    throw error;
                }));
                (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, `Current Context: ${JSON.stringify(curContext)}`);
                config = this.handleSharedConfig(config, curContext);
                core.endGroup();
                this.applyContext(configs, config, curContext);
            }
        });
    }
    /**
     * Combine the Shared & Context.type Configs
     * @author TGTGamer
     * @since 1.1.0
     */
    handleSharedConfig(config, curContext) {
        for (const a in config.sharedConfig) {
            if (a) {
                const action = a;
                if (!action || (!config[curContext.type] && !this.fillEmpty)) {
                    return config;
                }
                if (!config[curContext.type]) {
                    config[curContext.type] = {};
                }
                if (action === 'stale') {
                    config[curContext.type][action] = config.sharedConfig[action];
                }
                else if (action === 'enforceConventions') {
                    config[curContext.type][action] = config.sharedConfig[action];
                }
                else if (action !== 'labels') {
                    return config;
                }
                for (const label in config.sharedConfig.labels) {
                    if (label) {
                        if (!config[curContext.type].labels) {
                            config[curContext.type].labels = {};
                        }
                        if (!(label in config[curContext.type])) {
                            const l = config.sharedConfig.labels[label];
                            if (l) {
                                config[curContext.type].labels[label] = l;
                            }
                        }
                    }
                }
            }
        }
        return config;
    }
    configureLabels(configs) {
        // eslint-disable-next-line unicorn/no-array-reduce
        return Object.entries(configs.labels ? configs.labels : []).reduce((acc, cur) => {
            acc[cur[0]] = cur[1].name;
            return acc;
        }, {});
    }
    /**
     * Get the configuration
     * @author IvanFon, TGTGamer, jbinda
     * @since 1.0.0
     */
    processConfig() {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!((_a = this.configJson) === null || _a === void 0 ? void 0 : _a.runners[0])) {
                if (!this.configPath) {
                    throw new Error('Configpath & configJson are undefined');
                }
                const pathConfig = yield JSON.parse(yield this.util.api.files.get(this.configPath, this.configRef));
                if (!pathConfig) {
                    throw new Error(`config not found at "${this.configPath}"`);
                }
                return pathConfig;
            }
            return this.configJson;
        });
    }
    /**
     * Handle the context
     * @author IvanFon, TGTGamer, jbinda
     * @since 1.0.0
     */
    processContext(config) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let curContext;
            if (context.payload.pull_request) {
                /**
                 * Pull Request Context
                 * @author IvanFon, TGTGamer, jbinda
                 * @since 1.0.0
                 */
                const ctx = yield index_js_1.PullRequests.parse(this.util, config, context).catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    (0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while parsing PR context: ' + String(error));
                    throw error;
                }));
                if (!ctx) {
                    throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Pull Request not found on context'));
                }
                (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, `PR context: ${JSON.stringify(ctx)}`);
                curContext = {
                    type: 'pr',
                    context: ctx,
                };
            }
            else if (context.payload.issue) {
                /**
                 * Issue Context
                 * @author IvanFon, TGTGamer, jbinda
                 * @since 1.0.0
                 */
                const ctx = yield index_js_1.Issues.parse(this.util, config, context).catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    (0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while parsing issue context: ' + String(error));
                    throw error;
                }));
                if (!ctx) {
                    throw new Error('Issue not found on context');
                }
                (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, `issue context: ${JSON.stringify(ctx)}`);
                curContext = {
                    type: 'issue',
                    context: ctx,
                };
            }
            else if (context.payload.project_card) {
                /**
                 * Project Context
                 * @author TGTGamer
                 * @since 1.0.0
                 */
                const ctx = yield index_js_1.Project.parse(this.util, config, context).catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    (0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while parsing Project context: ' + String(error));
                    throw error;
                }));
                if (!ctx) {
                    throw new Error('Project Card not found on context');
                }
                (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, `Project Card context: ${JSON.stringify(ctx)}`);
                curContext = {
                    type: 'project',
                    context: ctx,
                };
            }
            else if (context.payload.schedule) {
                /**
                 * Project Schedule Context
                 * @author TGTGamer
                 * @since 1.0.0
                 */
                const ctx = yield index_js_1.Schedule.parse(context).catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    (0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while parsing Schedule context: ' + String(error));
                    throw error;
                }));
                if (!ctx) {
                    throw new Error('Schedule not found on context');
                }
                (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, `Schedule context: ${JSON.stringify(ctx)}`);
                curContext = {
                    type: 'schedule',
                    context: ctx,
                };
            }
            else {
                /**
                 * No Context
                 * @author TGTGamer
                 * @since 1.1.0
                 */
                (0, logging_js_1.log)(logging_js_1.LoggingLevels.notice, `There is no context to parse: ${JSON.stringify(context.payload)}`);
                throw new Error(`There is no context to parse: ${JSON.stringify(context.payload)}`);
            }
            return curContext;
        });
    }
    /**
     * Syncronise labels to repository
     * @author IvanFon, TGTGamer, jbinda
     * @since 1.0.0
     */
    syncLabels(config) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // eslint-disable-next-line unicorn/no-array-reduce
            const labels = Object.entries(config.labels ? config.labels : []).reduce((acc, cur) => {
                if (cur[0] === '$schema') {
                    return acc;
                }
                acc[cur[1].name.toLowerCase()] = cur[1];
                return acc;
            }, {});
            yield this.util.labels.sync(labels).catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                (0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while handling syncLabels tasks:'
                    + String(error));
                throw error;
            }));
        });
    }
    applyContext(runners, config, curContext) {
        let ctx;
        switch (curContext.type) {
            case 'pr':
                ctx = new index_js_1.PullRequests(this.util, runners, config, curContext, this.dryRun);
                break;
            case 'issue':
                ctx = new index_js_1.Issues(this.util, runners, config, curContext, this.dryRun);
                break;
            case 'project':
                ctx = new index_js_1.Project(this.util, runners, config, curContext, this.dryRun);
                break;
            case 'schedule':
                ctx = new index_js_1.Schedule(this.util, runners, config, curContext, this.dryRun);
                break;
            default:
                ctx = undefined;
        }
        if (!ctx) {
            throw new Error((0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Context not found'));
        }
        ctx.run().catch((error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            (0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while running context: ' + String(error));
            throw error;
        }));
    }
}
exports.default = Action;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHOzs7QUFFSCxxQ0FBcUM7QUFDckMsNERBQTREO0FBRTVELDhEQUF5QjtBQUN6QixxRUFBMEM7QUFDMUMsNERBQXNDO0FBQ3RDLDRDQUFxRDtBQUtyRCxrREFBNEU7QUFDNUUsK0NBQXVDO0FBQ3ZDLDZDQUFnRDtBQUdoRCxNQUFNLE9BQU8sR0FBWSxpQkFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFBLGtCQUFHLEdBQUUsR0FBRyxjQUFjLENBQUMsQ0FBQztBQUMvRCxJQUFJLEtBQVUsQ0FBQztBQUNmLElBQUksT0FBTyxHQUFHLGdCQUFTLENBQUM7QUFFeEIsTUFBcUIsTUFBTTtJQVkxQixZQUFZLE1BQWMsRUFBRSxPQUFnQjs7UUFDM0MsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQztRQUNwQixJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFDN0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQztRQUNyQyxJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUM7UUFDbkMsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO1FBQ25DLElBQUksQ0FBQyxHQUFHLEdBQUcsTUFBQSxPQUFPLENBQUMsR0FBRyxtQ0FBSSxPQUFPLENBQUMsR0FBRyxDQUFDO0lBQ3ZDLENBQUM7SUFFSyxHQUFHOzs7WUFDUixJQUFJLE9BQU8sRUFB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