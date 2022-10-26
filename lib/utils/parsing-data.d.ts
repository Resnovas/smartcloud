import type { Labels } from '../types.js';
/**
 * Formats the hex color code to ensure no hash (#) is included
 * @author IvanFon, TGTGamer
 * @param {String} color Hex color code
 * @since 1.0.0
 */
export declare const formatColor: (color: string) => string;
/**
 * Formats the hex color code to ensure no hash (#) is included
 * @author IvanFon, jbinda
 * @param {String} condition Regex partern to use
 * @since 1.0.0
 */
export declare const processRegExpcondition: (condition: string) => RegExp;
/**
 * Normalizes text toUpperCase
 * @author IvanFon, TGTGamer
 * @since 1.0.0
 */
export declare const normalize: (text: string) => string;
/**
 * Parse the labels
 * @author IvanFon, TGTGamer, jbinda
 * @since 1.0.0
 */
export declare const parseLabels: (labels: any) => Promise<Labels | undefined>;
