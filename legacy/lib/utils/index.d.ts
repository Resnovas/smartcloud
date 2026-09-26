import type { SimpleGit, SimpleGitOptions } from 'simple-git';
import type { Github, Config, Label, Runners } from '../types.js';
import type { Reviews, UtilThis } from '../conditions/index.js';
export declare class Utils {
    client: Github;
    repo: Repo;
    dryRun: boolean;
    skipDelete: boolean;
    ref?: string;
    git: SimpleGit;
    api: {
        files: {
            get: (file: string, ref?: string) => Promise<string>;
            list: (IDNumber: number) => Promise<any>;
        };
        issues: {
            get: (IDNumber: number) => Promise<any>;
            create: (title: string, body: string, labels: string[], assignees: string[], milestone: string) => Promise<any>;
            list: ({ state, sort, direction, }: {
                state?: "open" | "closed" | "all";
                sort?: "created" | "updated" | "comments";
                direction?: "asc" | "desc";
            }) => Promise<any>;
            comments: {
                list: (IDNumber: number) => Promise<any>;
                get: (IDNumber: number) => Promise<any>;
                create: (IDNumber: number, body: string) => Promise<any>;
                update: (comment_id: number, body: string) => Promise<any>;
                delete: (comment_id: number) => Promise<any>;
            };
        };
        labels: {
            add: (IDNumber: number, label: string) => Promise<void>;
            create: (label: Label) => Promise<void>;
            del: (name: string) => Promise<void>;
            get: () => Promise<import("../types.js").Labels>;
            remove: (IDNumber: number, label: string) => Promise<void>;
            update: (current_name: string, label: Label) => Promise<void>;
        };
        project: {
            column: {
                list: (project_id: number) => Promise<any>;
                get: (column_id: number) => Promise<any>;
                listCards: (column_id: number) => Promise<any>;
            };
            card: {
                get: (card_id: number) => Promise<any>;
                create: (content_id: number, column_id: number, content_type?: "Issue" | "PullRequest") => Promise<any>;
                move: (card_id: number, column_id: number) => Promise<any>;
            };
            projects: {
                get: (project_id: number) => Promise<any>;
                org: (org: string) => Promise<any>;
                user: (user: string) => Promise<any>;
                repo: (owner: string, repo: string) => Promise<any>;
            };
        };
        pullRequests: {
            list: (IDNumber: number) => Promise<any>;
            changes: (additions: number, deletions: number) => Promise<number>;
            reviews: {
                create: (IDNumber: number, body?: string, event?: Event, comments?: Array<{
                    path: string;
                    position?: number | undefined;
                    body: string;
                    line?: number | undefined;
                    side?: string | undefined;
                    start_line?: number | undefined;
                    start_side?: string | undefined;
                }>) => Promise<any>;
                requestReviewers: (IDNumber: number, reviewers: string[]) => Promise<any>;
                update: (IDNumber: number, review_id: number, body: string) => Promise<any>;
                dismiss: (IDNumber: number, review_id: number, message: string) => Promise<any>;
                list: (IDNumber: number) => Promise<any>;
                requestedChanges: (reviews: Reviews) => Promise<number>;
                isApproved: (reviews: Reviews) => Promise<number>;
                pending: (reviews: number, requested_reviews: number) => Promise<boolean>;
            };
        };
        tags: {
            get: () => Promise<Tags>;
        };
    };
    labels: {
        sync: (config: Runners["labels"]) => Promise<void>;
        addRemove: (labelName: string, IDNumber: number, hasLabel: boolean, shouldHaveLabel: boolean) => Promise<void>;
    };
    parsingData: {
        formatColor: (color: string) => Promise<string>;
        processRegExpcondition: (condition: string) => Promise<RegExp>;
        normalize: (text: string) => Promise<string>;
        labels: (labels: any) => Promise<import("../types.js").Labels | undefined>;
    };
    versioning: {
        parse: (config: Config, ref?: string) => Promise<import("../conditions/index.js").Version>;
    };
    constructor(props: ApiProps, options: {
        dryRun: boolean;
        skipDelete: boolean;
        ref?: string;
    }, { git }: {
        git?: SimpleGitOptions;
    });
    respond: (that: UtilThis, success: boolean, { event, previousComment, body, }: {
        event?: Event;
        previousComment?: number;
        body?: string;
    }) => Promise<void>;
}
export type Repo = {
    owner: string;
    repo: string;
};
export type ApiProps = {
    client: Github;
    repo: Repo;
};
export type Functionality = 'release' | 'convention' | 'label';
export type Event = 'REQUEST_CHANGES' | 'APPROVE' | 'COMMENT';
export type Tags = string[];
