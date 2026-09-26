import type { UtilThis } from '../conditions/index.js';
import type { Event } from './index.js';
export declare function respond(this: UtilThis, success: boolean, event: Event | undefined, // eslint-disable-line @typescript-eslint/default-param-last
{ previousComment, body, }: {
    previousComment?: number;
    body?: string;
}): Promise<void>;
