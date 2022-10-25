import type { Config } from '../types.js';
import type { Version } from '../conditions/index.js';
import type { Utils } from './index.js';
/**
 * Gets the version information
 * @author IvanFon, TGTGamer
 * @since 1.0.0
 */
export declare function parse(this: Utils, config: Config, ref?: string): Promise<Version>;
export declare function getNodeVersion(this: Utils, root: string, ref?: string): Promise<string>;
