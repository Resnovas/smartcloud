/*
 * Project: @resnovas/smartcloud
 * File: testing.js
 * Path: \.gulp\testing.js
 * Created Date: Monday, September 5th 2022
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
 * Last Modified: 25-10-2022
 * By: Jonathan Stevens (Email: jonathan@resnovas.com, Github: https://github.com/TGTGamer)
 * Current Version: 1.0.0-beta.0
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */

import rename from "gulp-rename";
import exec from "gulp-exec";
import pkg from 'gulp';
const { src, dest } = pkg

export class Testing {
  static run = () => {
    return src("package.json")
      .pipe(exec(`npm run run`))
      .pipe(exec.reporter());
  };
  static package = () => {
    return src("package.json")
      .pipe(exec(`npm run package`))
      .pipe(exec.reporter());
  };
  static cleanup = () => {
    return src("package.json")
      .pipe(exec(`del config.json,context.json`))
      .pipe(exec.reporter());
  };
  static copy = {
    config: () => {
      return src("contexts/config.json").pipe(dest("./"));
    },
    context: {
      issue: () => {
        return src("contexts/issue.json")
          .pipe(
            rename(function (path) {
              path.basename = "context";
            })
          )
          .pipe(dest("./"));
      },
      pr: () => {
        return src("contexts/pr.json")
          .pipe(
            rename(function (path) {
              path.basename = "context";
            })
          )
          .pipe(dest("./"));
      },
      project: () => {
        return src("contexts/project.json")
          .pipe(
            rename(function (path) {
              path.basename = "context";
            })
          )
          .pipe(dest("./"));
      },
      schedule: () => {
        return src("contexts/schedule.json")
          .pipe(
            rename(function (path) {
              path.basename = "context";
            })
          )
          .pipe(dest("./"));
      },
    },
  };
}
