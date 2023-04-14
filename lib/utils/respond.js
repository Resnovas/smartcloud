"use strict";
/*
 * Project: @resnovas/smartcloud
 * File: respond.ts
 * Path: \src\utils\respond.ts
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
exports.respond = void 0;
const tslib_1 = require("tslib");
function respond(success, event = 'REQUEST_CHANGES', // eslint-disable-line @typescript-eslint/default-param-last
{ previousComment, body, }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!('number' in this.curContext.context.props)) {
            throw new Error('ID ("number") value is required');
        }
        if (!previousComment && success && event !== 'APPROVE') {
            // No need to comment if there is no previous comment and the job is successful
            return;
        }
        if ((!previousComment && !success) || event === 'APPROVE') {
            // Does not have a previous comment || is not successful or is an approval
            if (this.curContext.type === 'pr') {
                yield this.util.api.pullRequests.reviews.create(this.curContext.context.props.number, body, event);
            }
            else {
                yield this.util.api.issues.comments.create(
                // @ts-expect-error Never reached but added for future cases
                this.curContext.context.props.number, body);
            }
        }
        else if (previousComment && !success) {
            // Has a previous comment & is not successful
            if (this.curContext.type === 'pr') {
                yield this.util.api.pullRequests.reviews.update(this.curContext.context.props.number, previousComment, body);
            }
            else {
                yield this.util.api.issues.comments.update(previousComment, body);
            }
        }
        else if (previousComment && success) {
            // Has a previous comment & is successful
            if (this.curContext.type === 'pr') {
                yield this.util.api.pullRequests.reviews.dismiss(this.curContext.context.props.number, previousComment, body);
            }
            else {
                yield this.util.api.issues.comments.delete(previousComment);
            }
        }
    });
}
exports.respond = respond;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9yZXNwb25kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQ0c7Ozs7QUFLSCxTQUFzQixPQUFPLENBRTVCLE9BQWdCLEVBQ2hCLFFBQWUsaUJBQWlCLEVBQUUsNERBQTREO0FBQzlGLEVBQ0MsZUFBZSxFQUNmLElBQUksR0FJSjs7UUFFRCxJQUFJLENBQUMsQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDakQsTUFBTSxJQUFJLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1NBQ25EO1FBRUQsSUFBSSxDQUFDLGVBQWUsSUFBSSxPQUFPLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRTtZQUN2RCwrRUFBK0U7WUFDL0UsT0FBTztTQUNQO1FBRUQsSUFBSSxDQUFDLENBQUMsZUFBZSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRTtZQUMxRCwwRUFBMEU7WUFDMUUsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7Z0JBQ2xDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQzlDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQ3BDLElBQUksRUFDSixLQUFLLENBQ0wsQ0FBQzthQUNGO2lCQUFNO2dCQUNOLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNO2dCQUN6Qyw0REFBNEQ7Z0JBQzVELElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQ3BDLElBQUssQ0FDTCxDQUFDO2FBQ0Y7U0FDRDthQUFNLElBQUksZUFBZSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ3ZDLDZDQUE2QztZQUU3QyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRTtnQkFDbEMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FDOUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFDcEMsZUFBZSxFQUNmLElBQUssQ0FDTCxDQUFDO2FBQ0Y7aUJBQU07Z0JBQ04sTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsSUFBSyxDQUFDLENBQUM7YUFDbkU7U0FDRDthQUFNLElBQUksZUFBZSxJQUFJLE9BQU8sRUFBRTtZQUN0Qyx5Q0FBeUM7WUFDekMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7Z0JBQ2xDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQy9DLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQ3BDLGVBQWUsRUFDZixJQUFLLENBQ0wsQ0FBQzthQUNGO2lCQUFNO2dCQUNOLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUM7YUFDNUQ7U0FDRDtJQUNGLENBQUM7Q0FBQTtBQTVERCwwQkE0REMifQ==