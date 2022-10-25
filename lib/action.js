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
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import fs from 'node:fs';
import process, { cwd } from 'node:process';
import * as core from '@actions/core';
import { context as GHContext } from '@actions/github';
import { Issues, Project, PullRequests, Schedule } from './contexts/index.js';
import { Utils } from './utils/index.js';
import { log, LoggingLevels } from './logging.js';
const localEx = fs.existsSync(cwd() + '/config.json');
let local;
let context = GHContext;
if (localEx) {
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error, @typescript-eslint/ban-ts-comment
    // @ts-ignore
    local = (await import('../config.json', { assert: { type: 'json' } }));
    process.env.GITHUB_REPOSITORY = local.default.GITHUB_REPOSITORY;
    process.env.GITHUB_REPOSITORY_OWNER = local.default.GITHUB_REPOSITORY_OWNER;
    if (!context.payload.issue && !context.payload.pull_request) {
        // eslint-disable-next-line unicorn/no-await-expression-member
        context = (await import(local.default.github_context, { assert: { type: 'json' } })).default;
    }
}
export default class Action {
    client;
    opts;
    configJson;
    configPath;
    configRef;
    dryRun;
    fillEmpty;
    repo = context.repo || {};
    util;
    ref;
    constructor(client, options) {
        core.startGroup('Setup Phase');
        this.client = client;
        this.opts = options;
        this.dryRun = options.dryRun;
        if (this.dryRun) {
            if (options.repo) {
                this.repo = options.repo;
            }
            if (!options.repo?.repo) {
                this.repo.repo = process.env.GITHUB_REPOSITORY ?? 'Unknown';
            }
            if (!options.repo?.owner) {
                this.repo.owner = process.env.GITHUB_REPOSITORY_OWNER ?? 'Unknown';
            }
        }
        this.configJson = options.configJson;
        this.configPath = options.configPath;
        this.configRef = options.configRef;
        this.fillEmpty = options.fillEmpty;
        this.ref = options.ref ?? context.ref;
        this.util = new Utils({ client, repo: this.repo }, { dryRun: options.dryRun, skipDelete: options.skipDelete, ref: this.ref }, {
            git: options.git,
        });
    }
    async run() {
        log(LoggingLevels.debug, `Repo data: ${this.repo.owner}/${this.repo.repo}`);
        /**
         * Capture and log context to debug for Local Running
         * @author TGTGamer
         * @since 1.0.0
         */
        log(LoggingLevels.debug, `Context for local running. See readme.md for information on how to setup local running: ${JSON.stringify(context)}`);
        /**
         * Process the config
         * @author TGTGamer
         * @since 1.1.0
         */
        const configs = await this.processConfig().catch(async (error) => {
            throw new Error(log(LoggingLevels.error, 'Error thrown while processing config: ' + String(error)));
        });
        if (!configs.runners[0]) {
            throw new Error(log(LoggingLevels.error, 'No config data.'));
        }
        log(LoggingLevels.debug, `Config: ${JSON.stringify(configs)}`);
        if (configs.labels) {
            /**
             * Syncronise the labels
             * @author TGTGamer
             * @since 1.1.0
             */
            core.startGroup('label Actions');
            log(LoggingLevels.debug, 'Attempting to apply labels');
            await this.syncLabels(configs).catch(async (error) => {
                throw new Error(log(LoggingLevels.error, 'Error thrown while syncronising labels: ' + String(error)));
            });
            log(LoggingLevels.notice, 'Successfully applied all labels');
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
                throw new Error(log(LoggingLevels.error, 'Error thrown while processing context: ' + String(error)));
            });
            log(LoggingLevels.debug, `Current Context: ${JSON.stringify(curContext)}`);
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
            const ctx = await PullRequests.parse(this.util, config, context).catch(async (error) => {
                throw new Error(log(LoggingLevels.error, 'Error thrown while parsing PR context: ' + String(error)));
            });
            if (!ctx) {
                throw new Error(log(LoggingLevels.error, 'Pull Request not found on context'));
            }
            log(LoggingLevels.debug, `PR context: ${JSON.stringify(ctx)}`);
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
            const ctx = await Issues.parse(this.util, config, context).catch(async (error) => {
                throw new Error(log(LoggingLevels.error, 'Error thrown while parsing issue context: ' + String(error)));
            });
            if (!ctx) {
                throw new Error('Issue not found on context');
            }
            log(LoggingLevels.debug, `issue context: ${JSON.stringify(ctx)}`);
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
            const ctx = await Project.parse(this.util, config, context).catch(async (error) => {
                throw new Error(log(LoggingLevels.error, 'Error thrown while parsing Project context: ' + String(error)));
            });
            if (!ctx) {
                throw new Error('Project Card not found on context');
            }
            log(LoggingLevels.debug, `Project Card context: ${JSON.stringify(ctx)}`);
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
            const ctx = await Schedule.parse(context).catch(async (error) => {
                throw new Error(log(LoggingLevels.error, 'Error thrown while parsing Schedule context: ' + String(error)));
            });
            if (!ctx) {
                throw new Error('Schedule not found on context');
            }
            log(LoggingLevels.debug, `Schedule context: ${JSON.stringify(ctx)}`);
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
            log(LoggingLevels.notice, `There is no context to parse: ${JSON.stringify(context.payload)}`);
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
            throw new Error(log(LoggingLevels.error, 'Error thrown while handling syncLabels tasks:'
                + String(error)));
        });
    }
    applyContext(runners, config, curContext) {
        let ctx;
        switch (curContext.type) {
            case 'pr':
                ctx = new PullRequests(this.util, runners, config, curContext, this.dryRun);
                break;
            case 'issue':
                ctx = new Issues(this.util, runners, config, curContext, this.dryRun);
                break;
            case 'project':
                ctx = new Project(this.util, runners, config, curContext, this.dryRun);
                break;
            case 'schedule':
                ctx = new Schedule(this.util, runners, config, curContext, this.dryRun);
                break;
            default:
                ctx = undefined;
        }
        if (!ctx) {
            throw new Error(log(LoggingLevels.error, 'Context not found'));
        }
        ctx.run().catch(async (error) => {
            throw new Error(log(LoggingLevels.error, 'Error thrown while running context: ' + String(error)));
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQ0c7QUFFSCxxQ0FBcUM7QUFDckMsNERBQTREO0FBRTVELE9BQU8sRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUN6QixPQUFPLE9BQU8sRUFBRSxFQUFDLEdBQUcsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUMxQyxPQUFPLEtBQUssSUFBSSxNQUFNLGVBQWUsQ0FBQztBQUN0QyxPQUFPLEVBQUMsT0FBTyxJQUFJLFNBQVMsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBSXJELE9BQU8sRUFBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUM1RSxPQUFPLEVBQUMsS0FBSyxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDdkMsT0FBTyxFQUFDLEdBQUcsRUFBRSxhQUFhLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFHaEQsTUFBTSxPQUFPLEdBQVksRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxjQUFjLENBQUMsQ0FBQztBQUMvRCxJQUFJLEtBQVUsQ0FBQztBQUNmLElBQUksT0FBTyxHQUFHLFNBQVMsQ0FBQztBQUV4QixJQUFJLE9BQU8sRUFBRTtJQUNaLHdHQUF3RztJQUN4RyxhQUFhO0lBRWIsS0FBSyxHQUFHLENBQUMsTUFBTSxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsRUFBQyxNQUFNLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbkUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDO0lBQ2hFLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLEdBQUcsS0FBSyxD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