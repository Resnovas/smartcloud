import type { Context } from '@actions/github/lib/context.js';
import type { Config, Runners, SharedConfig } from '../types.js';
import type { CurContext, ScheduleContext } from '../conditions/index.js';
import type { Utils } from '../utils/index.js';
import { Contexts } from './methods/index.js';
/**
 * The schedule configuration
 */
export declare type ScheduleConfig = SharedConfig;
export declare class Schedule extends Contexts {
    /**
     * Parse the Schedule Context
     * @author TGTGamer
     * @since 1.0.0
     */
    static parse(context: Context): Promise<ScheduleContext | undefined>;
    context: ScheduleContext;
    ctx: ScheduleContext;
    config: ScheduleConfig;
    constructor(util: Utils, runners: Runners, configs: Config, curContext: CurContext, dryRun: boolean);
    run(attempt?: number): Promise<void>;
}
