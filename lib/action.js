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
                context = await Promise.resolve(`${local.github_context}`).then(s => tslib_1.__importStar(require(s)));
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