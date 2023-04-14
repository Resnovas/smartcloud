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
                get: (file, ref) => tslib_1.__awaiter(this, void 0, void 0, function* () { return APIFiles.get.call(this, file, ref); }),
                list: (IDNumber) => tslib_1.__awaiter(this, void 0, void 0, function* () { return APIFiles.list.call(this, IDNumber); }),
            },
            issues: {
                get: (IDNumber) => tslib_1.__awaiter(this, void 0, void 0, function* () { return APIIssues.get.call(this, IDNumber); }),
                // eslint-disable-next-line max-params
                create: (title, body, labels, assignees, milestone) => tslib_1.__awaiter(this, void 0, void 0, function* () { return APIIssues.create.call(this, title, body, labels, assignees, milestone); }),
                list: ({ state, sort, direction, }) => tslib_1.__awaiter(this, void 0, void 0, function* () { return APIIssues.list.call(this, { state, sort, direction }); }),
                comments: {
                    list: (IDNumber) => tslib_1.__awaiter(this, void 0, void 0, function* () { return APIIssues.comments.list.call(this, IDNumber); }),
                    get: (IDNumber) => tslib_1.__awaiter(this, void 0, void 0, function* () { return APIIssues.comments.get.call(this, IDNumber); }),
                    create: (IDNumber, body) => tslib_1.__awaiter(this, void 0, void 0, function* () { return APIIssues.comments.create.call(this, IDNumber, body); }),
                    update: (comment_id, body) => tslib_1.__awaiter(this, void 0, void 0, function* () { return APIIssues.comments.update.call(this, comment_id, body); }),
                    delete: (comment_id) => tslib_1.__awaiter(this, void 0, void 0, function* () { return APIIssues.comments.delete.call(this, comment_id); }),
                },
            },
            labels: {
                add: (IDNumber, label) => tslib_1.__awaiter(this, void 0, void 0, function* () { return APILabels.add.call(this, IDNumber, label); }),
                create: (label) => tslib_1.__awaiter(this, void 0, void 0, function* () { return APILabels.create.call(this, label); }),
                del: (name) => tslib_1.__awaiter(this, void 0, void 0, function* () { return APILabels.del.call(this, name); }),
                get: () => tslib_1.__awaiter(this, void 0, void 0, function* () { return APILabels.get.call(this); }),
                remove: (IDNumber, label) => tslib_1.__awaiter(this, void 0, void 0, function* () { return APILabels.remove.call(this, IDNumber, label); }),
                update: (current_name, label) => tslib_1.__awaiter(this, void 0, void 0, function* () { return APILabels.update.call(this, current_name, label); }),
            },
            project: {
                column: {
                    list: (project_id) => tslib_1.__awaiter(this, void 0, void 0, function* () { return APIProject.column.list.call(this, project_id); }),
                    get: (column_id) => tslib_1.__awaiter(this, void 0, void 0, function* () { return APIProject.column.get.call(this, column_id); }),
                    listCards: (column_id) => tslib_1.__awaiter(this, void 0, void 0, function* () { return APIProject.column.listCards.call(this, column_id); }),
                },
                card: {
                    get: (card_id) => tslib_1.__awaiter(this, void 0, void 0, function* () { return APIProject.card.get.call(this, card_id); }),
                    create: (content_id, column_id, content_type) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        return APIProject.card.create.call(this, content_id, column_id, content_type);
                    }),
                    move: (card_id, column_id) => tslib_1.__awaiter(this, void 0, void 0, function* () { return APIProject.card.move.call(this, card_id, column_id); }),
                },
                projects: {
                    get: (project_id) => tslib_1.__awaiter(this, void 0, void 0, function* () { return APIProject.projects.get.call(this, project_id); }),
                    org: (org) => tslib_1.__awaiter(this, void 0, void 0, function* () { return APIProject.projects.org.call(this, org); }),
                    user: (user) => tslib_1.__awaiter(this, void 0, void 0, function* () { return APIProject.projects.user.call(this, user); }),
                    repo: (owner, repo) => tslib_1.__awaiter(this, void 0, void 0, function* () { return APIProject.projects.repo.call(this, owner, repo); }),
                },
            },
            pullRequests: {
                list: (IDNumber) => tslib_1.__awaiter(this, void 0, void 0, function* () { return APIPullRequests.list.call(this, IDNumber); }),
                changes: (additions, deletions) => tslib_1.__awaiter(this, void 0, void 0, function* () { return APIPullRequests.changes(additions, deletions); }),
                reviews: {
                    create: (IDNumber, body, event, comments) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        return APIPullRequests.reviews.create.call(this, IDNumber, {
                            body,
                            event,
                            comments,
                        });
                    }),
                    requestReviewers: (IDNumber, reviewers) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        return APIPullRequests.reviews.requestReviewers.call(this, IDNumber, reviewers);
                    }),
                    update: (IDNumber, review_id, body) => tslib_1.__awaiter(this, void 0, void 0, function* () { return APIPullRequests.reviews.update.call(this, IDNumber, review_id, body); }),
                    dismiss: (IDNumber, review_id, message) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        return APIPullRequests.reviews.dismiss.call(this, IDNumber, review_id, message);
                    }),
                    list: (IDNumber) => tslib_1.__awaiter(this, void 0, void 0, function* () { return APIPullRequests.reviews.list.call(this, IDNumber); }),
                    requestedChanges: (reviews) => tslib_1.__awaiter(this, void 0, void 0, function* () { return APIPullRequests.reviews.requestedChanges.call(this, reviews); }),
                    isApproved: (reviews) => tslib_1.__awaiter(this, void 0, void 0, function* () { return APIPullRequests.reviews.isApproved(reviews); }),
                    pending: (reviews, requested_reviews) => tslib_1.__awaiter(this, void 0, void 0, function* () { return APIPullRequests.reviews.pending(reviews, requested_reviews); }),
                },
            },
            tags: {
                get: () => tslib_1.__awaiter(this, void 0, void 0, function* () { return APITag.get.call(this); }),
            },
        };
        this.labels = {
            sync: (config) => tslib_1.__awaiter(this, void 0, void 0, function* () { return UtilLabels.sync.call(this, config); }),
            addRemove: (labelName, IDNumber, hasLabel, shouldHaveLabel) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                return UtilLabels.addRemove.call(this, labelName, IDNumber, hasLabel, shouldHaveLabel);
            }),
        };
        this.parsingData = {
            formatColor: (color) => tslib_1.__awaiter(this, void 0, void 0, function* () { return UtilParsingData.formatColor(color); }),
            processRegExpcondition: (condition) => tslib_1.__awaiter(this, void 0, void 0, function* () { return UtilParsingData.processRegExpcondition(condition); }),
            normalize: (text) => tslib_1.__awaiter(this, void 0, void 0, function* () { return UtilParsingData.normalize(text); }),
            labels: (labels) => tslib_1.__awaiter(this, void 0, void 0, function* () { return UtilParsingData.parseLabels(labels); }),
        };
        this.versioning = {
            parse: (config, ref) => tslib_1.__awaiter(this, void 0, void 0, function* () { return UtilVersioning.parse.call(this, config, ref); }),
        };
        this.respond = (that, success, { event, previousComment, body, }) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield UtilRespond.respond.call(that, success, event, { previousComment, body });
        });
        this.client = props.client;
        this.repo = props.repo;
        this.dryRun = options.dryRun;
        this.skipDelete = options.skipDelete;
        this.ref = options.ref;
        this.git = git
            ? (0, simple_git_1.simpleGit)(Object.assign(Object.assign({}, git), { 
                // eslint-disable-next-line n/prefer-global/process
                baseDir: git.baseDir ? git.baseDir : process.cwd(), binary: 'git', maxConcurrentProcesses: 6, config: git.config ? git.config : [] }))
            : (0, simple_git_1.simpleGit)();
    }
}
exports.Utils = Utils;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNDRzs7OztBQUdILDJDQUFxQztBQUdyQyxpRUFBMkM7QUFDM0MsbUVBQTZDO0FBQzdDLG1FQUE2QztBQUM3QyxxRUFBK0M7QUFDL0MsZ0ZBQTBEO0FBQzFELDhEQUF3QztBQUN4QyxnRUFBMEM7QUFDMUMsMkVBQXFEO0FBQ3JELGtFQUE0QztBQUM1Qyx3RUFBa0Q7QUFFbEQsTUFBYSxLQUFLO0lBcUxqQixZQUNDLEtBQWUsRUFDZixPQUE2RCxFQUM3RCxFQUFDLEdBQUcsRUFBMkI7UUFqTGhDLFFBQUcsR0FBRztZQUNMLEtBQUssRUFBRTtnQkFDTixHQUFHLEVBQUUsQ0FBTyxJQUFZLEVBQUUsR0FBWSxFQUFFLEVBQUUsd0RBQ3pDLE9BQUEsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQSxHQUFBO2dCQUNuQyxJQUFJLEVBQUUsQ0FBTyxRQUFnQixFQUFFLEVBQUUsd0RBQUMsT0FBQSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUEsR0FBQTthQUNwRTtZQUNELE1BQU0sRUFBRTtnQkFDUCxHQUFHLEVBQUUsQ0FBTyxRQUFnQixFQUFFLEVBQUUsd0RBQUMsT0FBQSxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUEsR0FBQTtnQkFDbkUsc0NBQXNDO2dCQUN0QyxNQUFNLEVBQUUsQ0FDUCxLQUFhLEVBQ2IsSUFBWSxFQUNaLE1BQWdCLEVBQ2hCLFNBQW1CLEVBQ25CLFNBQWlCLEVBQ2hCLEVBQUUsd0RBQ0gsT0FBQSxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUks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