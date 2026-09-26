import type { Utils } from '../index.js';
export declare const column: {
    list(this: Utils, project_id: number): Promise<any>;
    get(this: Utils, column_id: number): Promise<any>;
    listCards(this: Utils, column_id: number): Promise<any>;
};
export declare const card: {
    get(this: Utils, card_id: number): Promise<any>;
    create(this: Utils, content_id: number, column_id: number, content_type?: "Issue" | "PullRequest"): Promise<any>;
    move(this: Utils, card_id: number, column_id: number): Promise<any>;
};
export declare const projects: {
    get(this: Utils, project_id: number): Promise<any>;
    org(this: Utils, org: string): Promise<any>;
    user(this: Utils, username: string): Promise<any>;
    repo(this: Utils, owner: string, repository: string): Promise<any>;
};
