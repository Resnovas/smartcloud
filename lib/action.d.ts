import type { Context } from '@actions/github/lib/context.js';
import type { CurContext } from './conditions/index.js';
import { Utils } from './utils/index.js';
import type { Options, Github, Config, Runners } from './types.js';
export default class Action {
    client: Github;
    opts: Options;
    configJson: Options['configJson'];
    configPath: Options['configPath'];
    configRef: Options['configRef'];
    dryRun: Options['dryRun'];
    fillEmpty: Options['fillEmpty'];
    repo: Context['repo'];
    util: Utils;
    ref?: string;
    constructor(client: Github, options: Options);
    run(): Promise<void>;
    /**
     * Combine the Shared & Context.type Configs
     * @author TGTGamer
     * @since 1.1.0
     */
    handleSharedConfig(config: Config, curContext: CurContext): Config;
    configureLabels(configs: Runners): Record<string, string>;
    /**
     * Get the configuration
     * @author IvanFon, TGTGamer, jbinda
     * @since 1.0.0
     */
    processConfig(): Promise<Runners>;
    /**
     * Handle the context
     * @author IvanFon, TGTGamer, jbinda
     * @since 1.0.0
     */
    processContext(config: Config): Promise<CurContext>;
    /**
     * Syncronise labels to repository
     * @author IvanFon, TGTGamer, jbinda
     * @since 1.0.0
     */
    syncLabels(config: Runners): Promise<void>;
    applyContext(runners: Runners, config: Config, curContext: CurContext): void;
}
