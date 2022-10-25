/*
 * Project: @resnovas/smartcloud
 * File: index.ts
 * Path: \src\utils\index.ts
 * Created Date: Saturday, October 8th 2022
 * Author: Jonathan Stevens (Email: jonathan@resnovas.com, Github: https://github.com/TGTGamer)
 * -----
 * Contributing: Please read through our contributing guidelines. Included are directions for opening
 * issues, coding standards, and notes on development. These can be found at https://github.com/resnovas/smartcloud/CONTRIBUTING.md
 *
 * Code of Conduct: This project abides by the Contributor Covenant, version 2.0. Please interact in ways that contribute to an open,
 * welcoming, diverse, inclusive, and healthy community. Our Code of Conduct can be found at https://github.com/resnovas/smartcloud/CODE_OF_CONDUCT.md
 * -----
 * Copyright (c) 2022 Resnovas - All Rights Reserved
 * LICENSE: GNU General Public License v3.0 or later (GPL-3.0+)
 * -----
 * This program has been provided under confidence of the copyright holder and is
 * licensed for copying, distribution and modification under the terms of
 * the GNU General Public License v3.0 or later (GPL-3.0+) published as the License,
 * or (at your option) any later version of this license.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License v3.0 or later for more details.
 *
 * You should have received a copy of the GNU General Public License v3.0 or later
 * along with this program. If not, please write to: jonathan@resnovas.com,
 * or see https://www.gnu.org/licenses/gpl-3.0-standalone.html
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE - PLEASE SEE THE LICENSE FILE FOR DETAILS
 * -----
 * Last Modified: 23-10-2022
 * By: Jonathan Stevens (Email: jonathan@resnovas.com, Github: https://github.com/TGTGamer)
 * Current Version: 1.0.0-beta.0
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */
import { simpleGit } from 'simple-git';
import * as APIFiles from './api/files.js';
import * as APIIssues from './api/issues.js';
import * as APILabels from './api/labels.js';
import * as APIProject from './api/project.js';
import * as APIPullRequests from './api/pull-requests.js';
import * as APITag from './api/tags.js';
import * as UtilLabels from './labels.js';
import * as UtilParsingData from './parsing-data.js';
import * as UtilRespond from './respond.js';
import * as UtilVersioning from './versioning.js';
export class Utils {
    client;
    repo;
    dryRun;
    skipDelete;
    ref;
    git;
    api = {
        files: {
            get: async (file, ref) => APIFiles.get.call(this, file, ref),
            list: async (IDNumber) => APIFiles.list.call(this, IDNumber),
        },
        issues: {
            get: async (IDNumber) => APIIssues.get.call(this, IDNumber),
            // eslint-disable-next-line max-params
            create: async (title, body, labels, assignees, milestone) => APIIssues.create.call(this, title, body, labels, assignees, milestone),
            list: async ({ state, sort, direction, }) => APIIssues.list.call(this, { state, sort, direction }),
            comments: {
                list: async (IDNumber) => APIIssues.comments.list.call(this, IDNumber),
                get: async (IDNumber) => APIIssues.comments.get.call(this, IDNumber),
                create: async (IDNumber, body) => APIIssues.comments.create.call(this, IDNumber, body),
                update: async (comment_id, body) => APIIssues.comments.update.call(this, comment_id, body),
                delete: async (comment_id) => APIIssues.comments.delete.call(this, comment_id),
            },
        },
        labels: {
            add: async (IDNumber, label) => APILabels.add.call(this, IDNumber, label),
            create: async (label) => APILabels.create.call(this, label),
            del: async (name) => APILabels.del.call(this, name),
            get: async () => APILabels.get.call(this),
            remove: async (IDNumber, label) => APILabels.remove.call(this, IDNumber, label),
            update: async (current_name, label) => APILabels.update.call(this, current_name, label),
        },
        project: {
            column: {
                list: async (project_id) => APIProject.column.list.call(this, project_id),
                get: async (column_id) => APIProject.column.get.call(this, column_id),
                listCards: async (column_id) => APIProject.column.listCards.call(this, column_id),
            },
            card: {
                get: async (card_id) => APIProject.card.get.call(this, card_id),
                create: async (content_id, column_id, content_type) => APIProject.card.create.call(this, content_id, column_id, content_type),
                move: async (card_id, column_id) => APIProject.card.move.call(this, card_id, column_id),
            },
            projects: {
                get: async (project_id) => APIProject.projects.get.call(this, project_id),
                org: async (org) => APIProject.projects.org.call(this, org),
                user: async (user) => APIProject.projects.user.call(this, user),
                repo: async (owner, repo) => APIProject.projects.repo.call(this, owner, repo),
            },
        },
        pullRequests: {
            list: async (IDNumber) => APIPullRequests.list.call(this, IDNumber),
            changes: async (additions, deletions) => APIPullRequests.changes(additions, deletions),
            reviews: {
                create: async (IDNumber, body, event, comments) => APIPullRequests.reviews.create.call(this, IDNumber, {
                    body,
                    event,
                    comments,
                }),
                requestReviewers: async (IDNumber, reviewers) => APIPullRequests.reviews.requestReviewers.call(this, IDNumber, reviewers),
                update: async (IDNumber, review_id, body) => APIPullRequests.reviews.update.call(this, IDNumber, review_id, body),
                dismiss: async (IDNumber, review_id, message) => APIPullRequests.reviews.dismiss.call(this, IDNumber, review_id, message),
                list: async (IDNumber) => APIPullRequests.reviews.list.call(this, IDNumber),
                requestedChanges: async (reviews) => APIPullRequests.reviews.requestedChanges.call(this, reviews),
                isApproved: async (reviews) => APIPullRequests.reviews.isApproved(reviews),
                pending: async (reviews, requested_reviews) => APIPullRequests.reviews.pending(reviews, requested_reviews),
            },
        },
        tags: {
            get: async () => APITag.get.call(this),
        },
    };
    labels = {
        sync: async (config) => UtilLabels.sync.call(this, config),
        addRemove: async (labelName, IDNumber, hasLabel, shouldHaveLabel) => UtilLabels.addRemove.call(this, labelName, IDNumber, hasLabel, shouldHaveLabel),
    };
    parsingData = {
        formatColor: async (color) => UtilParsingData.formatColor(color),
        processRegExpcondition: async (condition) => UtilParsingData.processRegExpcondition(condition),
        normalize: async (text) => UtilParsingData.normalize(text),
        labels: async (labels) => UtilParsingData.parseLabels(labels),
    };
    versioning = {
        parse: async (config, ref) => UtilVersioning.parse.call(this, config, ref),
    };
    constructor(props, options, { git }) {
        this.client = props.client;
        this.repo = props.repo;
        this.dryRun = options.dryRun;
        this.skipDelete = options.skipDelete;
        this.ref = options.ref;
        this.git = git
            ? simpleGit({
                ...git,
                // eslint-disable-next-line n/prefer-global/process
                baseDir: git.baseDir ? git.baseDir : process.cwd(),
                binary: 'git',
                maxConcurrentProcesses: 6,
                config: git.config ? git.config : [],
            })
            : simpleGit();
    }
    respond = async (that, success, { event, previousComment, body, }) => {
        await UtilRespond.respond.call(that, success, event, { previousComment, body });
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHO0FBR0gsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUdyQyxPQUFPLEtBQUssUUFBUSxNQUFNLGdCQUFnQixDQUFDO0FBQzNDLE9BQU8sS0FBSyxTQUFTLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxLQUFLLFNBQVMsTUFBTSxpQkFBaUIsQ0FBQztBQUM3QyxPQUFPLEtBQUssVUFBVSxNQUFNLGtCQUFrQixDQUFDO0FBQy9DLE9BQU8sS0FBSyxlQUFlLE1BQU0sd0JBQXdCLENBQUM7QUFDMUQsT0FBTyxLQUFLLE1BQU0sTUFBTSxlQUFlLENBQUM7QUFDeEMsT0FBTyxLQUFLLFVBQVUsTUFBTSxhQUFhLENBQUM7QUFDMUMsT0FBTyxLQUFLLGVBQWUsTUFBTSxtQkFBbUIsQ0FBQztBQUNyRCxPQUFPLEtBQUssV0FBVyxNQUFNLGNBQWMsQ0FBQztBQUM1QyxPQUFPLEtBQUssY0FBYyxNQUFNLGlCQUFpQixDQUFDO0FBRWxELE1BQU0sT0FBTyxLQUFLO0lBQ2pCLE1BQU0sQ0FBUztJQUNmLElBQUksQ0FBTztJQUNYLE1BQU0sQ0FBVTtJQUNoQixVQUFVLENBQVU7SUFDcEIsR0FBRyxDQUFVO0lBQ2IsR0FBRyxDQUFZO0lBQ2YsR0FBRyxHQUFHO1FBQ0wsS0FBSyxFQUFFO1lBQ04sR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFZLEVBQUUsR0FBWSxFQUFFLEVBQUUsQ0FDekMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUM7WUFDbkMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFnQixFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElB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