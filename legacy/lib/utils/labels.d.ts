import type { Runners } from '../types.js';
import type { Utils } from './index.js';
/**
 * Syncronise labels to repository
 * @author IvanFon, TGTGamer, jbinda
 * @since 1.0.0
 */
export declare function sync(this: Utils, config: Runners['labels']): Promise<void>;
/**
 * Add or Remove Labels
 * @author IvanFon, TGTGamer, jbinda
 * @since 1.0.0
 */
export declare function addRemove(this: Utils, labelName: string, IDNumber: number, hasLabel: boolean, shouldHaveLabel: boolean): Promise<void>;
