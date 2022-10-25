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
export async function respond(success, event = 'REQUEST_CHANGES', // eslint-disable-line @typescript-eslint/default-param-last
{ previousComment, body, }) {
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
            await this.util.api.pullRequests.reviews.create(this.curContext.context.props.number, body, event);
        }
        else {
            await this.util.api.issues.comments.create(
            // @ts-expect-error Never reached but added for future cases
            this.curContext.context.props.number, body);
        }
    }
    else if (previousComment && !success) {
        // Has a previous comment & is not successful
        if (this.curContext.type === 'pr') {
            await this.util.api.pullRequests.reviews.update(this.curContext.context.props.number, previousComment, body);
        }
        else {
            await this.util.api.issues.comments.update(previousComment, body);
        }
    }
    else if (previousComment && success) {
        // Has a previous comment & is successful
        if (this.curContext.type === 'pr') {
            await this.util.api.pullRequests.reviews.dismiss(this.curContext.context.props.number, previousComment, body);
        }
        else {
            await this.util.api.issues.comments.delete(previousComment);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9yZXNwb25kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNDRztBQUtILE1BQU0sQ0FBQyxLQUFLLFVBQVUsT0FBTyxDQUU1QixPQUFnQixFQUNoQixRQUFlLGlCQUFpQixFQUFFLDREQUE0RDtBQUM5RixFQUNDLGVBQWUsRUFDZixJQUFJLEdBSUo7SUFFRCxJQUFJLENBQUMsQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDakQsTUFBTSxJQUFJLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO0tBQ25EO0lBRUQsSUFBSSxDQUFDLGVBQWUsSUFBSSxPQUFPLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRTtRQUN2RCwrRUFBK0U7UUFDL0UsT0FBTztLQUNQO0lBRUQsSUFBSSxDQUFDLENBQUMsZUFBZSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRTtRQUMxRCwwRUFBMEU7UUFDMUUsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7WUFDbEMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FDOUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFDcEMsSUFBSSxFQUNKLEtBQUssQ0FDTCxDQUFDO1NBQ0Y7YUFBTTtZQUNOLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNO1lBQ3pDLDREQUE0RDtZQUM1RCxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUNwQyxJQUFLLENBQ0wsQ0FBQztTQUNGO0tBQ0Q7U0FBTSxJQUFJLGVBQWUsSUFBSSxDQUFDLE9BQU8sRUFBRTtRQUN2Qyw2Q0FBNkM7UUFFN0MsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7WUFDbEMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FDOUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFDcEMsZUFBZSxFQUNmLElBQUssQ0FDTCxDQUFDO1NBQ0Y7YUFBTTtZQUNOLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLElBQUssQ0FBQyxDQUFDO1NBQ25FO0tBQ0Q7U0FBTSxJQUFJLGVBQWUsSUFBSSxPQUFPLEVBQUU7UUFDdEMseUNBQXlDO1FBQ3pDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFO1lBQ2xDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQy9DLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQ3BDLGVBQWUsRUFDZixJQUFLLENBQ0wsQ0FBQztTQUNGO2FBQU07WUFDTixNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1NBQzVEO0tBQ0Q7QUFDRixDQUFDIn0=