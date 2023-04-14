"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
const tslib_1 = require("tslib");
const simple_git_1 = require("simple-git");
const APIFiles = tslib_1.__importStar(require("./api/files.js"));
const APIIssues = tslib_1.__importStar(require("./api/issues.js"));
const APILabels = tslib_1.__importStar(require("./api/labels.js"));
const APIProject = tslib_1.__importStar(require("./api/project.js"));
const APIPullRequests = tslib_1.__importStar(require("./api/pull-requests.js"));
const APITag = tslib_1.__importStar(require("./api/tags.js"));
const UtilLabels = tslib_1.__importStar(require("./labels.js"));
const UtilParsingData = tslib_1.__importStar(require("./parsing-data.js"));
const UtilRespond = tslib_1.__importStar(require("./respond.js"));
const UtilVersioning = tslib_1.__importStar(require("./versioning.js"));
class Utils {
    constructor(props, options, { git }) {
        this.api = {
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
        this.labels = {
            sync: async (config) => UtilLabels.sync.call(this, config),
            addRemove: async (labelName, IDNumber, hasLabel, shouldHaveLabel) => UtilLabels.addRemove.call(this, labelName, IDNumber, hasLabel, shouldHaveLabel),
        };
        this.parsingData = {
            formatColor: async (color) => UtilParsingData.formatColor(color),
            processRegExpcondition: async (condition) => UtilParsingData.processRegExpcondition(condition),
            normalize: async (text) => UtilParsingData.normalize(text),
            labels: async (labels) => UtilParsingData.parseLabels(labels),
        };
        this.versioning = {
            parse: async (config, ref) => UtilVersioning.parse.call(this, config, ref),
        };
        this.respond = async (that, success, { event, previousComment, body, }) => {
            await UtilRespond.respond.call(that, success, event, { previousComment, body });
        };
        this.client = props.client;
        this.repo = props.repo;
        this.dryRun = options.dryRun;
        this.skipDelete = options.skipDelete;
        this.ref = options.ref;
        this.git = git
            ? (0, simple_git_1.simpleGit)({
                ...git,
                // eslint-disable-next-line n/prefer-global/process
                baseDir: git.baseDir ? git.baseDir : process.cwd(),
                binary: 'git',
                maxConcurrentProcesses: 6,
                config: git.config ? git.config : [],
            })
            : (0, simple_git_1.simpleGit)();
    }
}
exports.Utils = Utils;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNDRzs7OztBQUdILDJDQUFxQztBQUdyQyxpRUFBMkM7QUFDM0MsbUVBQTZDO0FBQzdDLG1FQUE2QztBQUM3QyxxRUFBK0M7QUFDL0MsZ0ZBQTBEO0FBQzFELDhEQUF3QztBQUN4QyxnRUFBMEM7QUFDMUMsMkVBQXFEO0FBQ3JELGtFQUE0QztBQUM1Qyx3RUFBa0Q7QUFFbEQsTUFBYSxLQUFLO0lBcUxqQixZQUNDLEtBQWUsRUFDZixPQUE2RCxFQUM3RCxFQUFDLEdBQUcsRUFBMkI7UUFqTGhDLFFBQUcsR0FBRztZQUNMLEtBQUssRUFBRTtnQkFDTixHQUFHLEVBQUUsS0FBSyxFQUFFLElBQVksRUFBRSxHQUFZLEVBQUUsRUFBRSxDQUN6QyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQztnQkFDbkMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFnQixFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDO2FBQ3BFO1lBQ0QsTUFBTSxFQUFFO2dCQUNQLEdBQUcsRUFBRSxLQUFLLEVBQUUsUUFBZ0IsRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQztnQkFDbkUsc0NBQXNDO2dCQUN0QyxNQUFNLEVBQUUsS0FBSyxFQUNaLEtBQWEsRUFDYixJQUFZLEVBQ1osTUFBZ0IsRUFDaEIsU0FBbUIsRUFDbkIsU0FBaUIsRUFDaEIsRUFBRSxDQUNILFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFF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