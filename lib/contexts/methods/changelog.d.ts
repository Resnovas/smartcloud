import type { ReleaseChanges } from './release.js';
/**
 * Changelog
 */
export declare type Changelog = {
    /**
     * The changelog title
     */
    title?: string;
    /**

 * The changelog body (before the sections)
     */
    body?: string;
} & ReleaseChanges;
