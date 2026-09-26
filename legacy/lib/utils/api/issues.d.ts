import type { Utils } from '../index.js';
export declare function create(this: Utils, title: string, body: string, labels: string[], assignees: string[], milestone: string, ref?: string): Promise<any>;
export declare function get(this: Utils, IDNumber: number, ref?: string): Promise<any>;
export declare function list(this: Utils, { state, sort, direction, page, ref, }: {
    state?: 'open' | 'closed' | 'all';
    sort?: 'created' | 'updated' | 'comments';
    direction?: 'asc' | 'desc';
    page?: number;
    ref?: string;
}): Promise<any>;
export declare const comments: {
    list(this: Utils, IDNumber: number, ref?: string): Promise<any>;
    get(this: Utils, comment_id: number, ref?: string): Promise<any>;
    create(this: Utils, IDNumber: number, body: string, ref?: string): Promise<any>;
    update(this: Utils, comment_id: number, body: string, ref?: string): Promise<any>;
    delete(this: Utils, comment_id: number, ref?: string): Promise<any>;
};
