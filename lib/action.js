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
        core.startGroup('Setup Phase');
        this.client = client;
        this.opts = options;
        this.dryRun = options.dryRun;
        this.configJson = options.configJson;
        this.configPath = options.configPath;
        this.configRef = options.configRef;
        this.fillEmpty = options.fillEmpty;
        this.ref = options.ref ?? context.ref;
    }
    async run() {
        if (localEx) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
            // @ts-ignore
            local = await Promise.resolve().then(() => tslib_1.__importStar(require('../config.json')));
            node_process_1.default.env.GITHUB_REPOSITORY = local.GITHUB_REPOSITORY;
            node_process_1.default.env.GITHUB_REPOSITORY_OWNER = local.GITHUB_REPOSITORY_OWNER;
            if (!context.payload.issue && !context.payload.pull_request) {
                context = await Promise.resolve().then(() => tslib_1.__importStar(require(local.github_context)));
            }
        }
        this.repo = context.repo;
        if (this.dryRun) {
            if (this.opts.repo) {
                this.repo = this.opts.repo;
            }
            if (!this.opts.repo?.repo) {
                this.repo.repo = node_process_1.default.env.GITHUB_REPOSITORY ?? 'Unknown';
            }
            if (!this.opts.repo?.owner) {
                this.repo.owner = node_process_1.default.env.GITHUB_REPOSITORY_OWNER ?? 'Unknown';
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
        const configs = await this.processConfig().catch(async (error) => {
            (0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while processing config: ' + String(error));
            throw error;
        });
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
            await this.syncLabels(configs).catch(async (error) => {
                (0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while syncronising labels: ' + String(error));
                throw error;
            });
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
            const curContext = await this.processContext(config).catch(async (error) => {
                (0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while processing context: ' + String(error));
                throw error;
            });
            (0, logging_js_1.log)(logging_js_1.LoggingLevels.debug, `Current Context: ${JSON.stringify(curContext)}`);
            config = this.handleSharedConfig(config, curContext);
            core.endGroup();
            this.applyContext(configs, config, curContext);
        }
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
    async processConfig() {
        if (!this.configJson?.runners[0]) {
            if (!this.configPath) {
                throw new Error('Configpath & configJson are undefined');
            }
            const pathConfig = await JSON.parse(await this.util.api.files.get(this.configPath, this.configRef));
            if (!pathConfig) {
                throw new Error(`config not found at "${this.configPath}"`);
            }
            return pathConfig;
        }
        return this.configJson;
    }
    /**
     * Handle the context
     * @author IvanFon, TGTGamer, jbinda
     * @since 1.0.0
     */
    async processContext(config) {
        let curContext;
        if (context.payload.pull_request) {
            /**
             * Pull Request Context
             * @author IvanFon, TGTGamer, jbinda
             * @since 1.0.0
             */
            const ctx = await index_js_1.PullRequests.parse(this.util, config, context).catch(async (error) => {
                (0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while parsing PR context: ' + String(error));
                throw error;
            });
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
            const ctx = await index_js_1.Issues.parse(this.util, config, context).catch(async (error) => {
                (0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while parsing issue context: ' + String(error));
                throw error;
            });
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
            const ctx = await index_js_1.Project.parse(this.util, config, context).catch(async (error) => {
                (0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while parsing Project context: ' + String(error));
                throw error;
            });
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
            const ctx = await index_js_1.Schedule.parse(context).catch(async (error) => {
                (0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while parsing Schedule context: ' + String(error));
                throw error;
            });
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
    }
    /**
     * Syncronise labels to repository
     * @author IvanFon, TGTGamer, jbinda
     * @since 1.0.0
     */
    async syncLabels(config) {
        // eslint-disable-next-line unicorn/no-array-reduce
        const labels = Object.entries(config.labels ? config.labels : []).reduce((acc, cur) => {
            if (cur[0] === '$schema') {
                return acc;
            }
            acc[cur[1].name.toLowerCase()] = cur[1];
            return acc;
        }, {});
        await this.util.labels.sync(labels).catch(async (error) => {
            (0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while handling syncLabels tasks:'
                + String(error));
            throw error;
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
        ctx.run().catch(async (error) => {
            (0, logging_js_1.log)(logging_js_1.LoggingLevels.error, 'Error thrown while running context: ' + String(error));
            throw error;
        });
    }
}
exports.default = Action;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHOzs7QUFFSCxxQ0FBcUM7QUFDckMsNERBQTREO0FBRTVELDhEQUF5QjtBQUN6QixxRUFBMEM7QUFDMUMsNERBQXNDO0FBQ3RDLDRDQUFxRDtBQUtyRCxrREFBNEU7QUFDNUUsK0NBQXVDO0FBQ3ZDLDZDQUFnRDtBQUdoRCxNQUFNLE9BQU8sR0FBWSxpQkFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFBLGtCQUFHLEdBQUUsR0FBRyxjQUFjLENBQUMsQ0FBQztBQUMvRCxJQUFJLEtBQVUsQ0FBQztBQUNmLElBQUksT0FBTyxHQUFHLGdCQUFTLENBQUM7QUFFeEIsTUFBcUIsTUFBTTtJQVkxQixZQUFZLE1BQWMsRUFBRSxPQUFnQjtRQUMzQyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQy9CLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUM3QixJQUFJLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUM7UUFDckMsSUFBSSxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztRQUNuQyxJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUM7UUFDbkMsSUFBSSxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUM7SUFDdkMsQ0FBQztJQUVELEtBQUssQ0FBQyxHQUFHO1FBQ1IsSUFBSSxPQUFPLEVB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