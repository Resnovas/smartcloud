/*
 * Project: @resnovas/smartcloud
 * File: gulpfile.js
 * Path: \gulpfile.js
 * Created Date: Monday, September 5th 2022
 * Author: Jonathan Stevens (Email: jonathan@resnovas.com, Github: https://github.com/TGTGamer)
 * -----
 * Contributing: Please read through our contributing guidelines. Included are directions for opening
 * issues, coding standards, and notes on development. These can be found at https://github.com/resnovas/smartcloud/CONTRIBUTING.md
 *
 * Code of Conduct: This project abides by the Contributor Covenant, version 2.0. Please interact in ways that contribute to an open,
 * welcoming, diverse, inclusive, and healthy community. Our Code of Conduct can be found at https://github.com/resnovas/smartcloud/CODE_OF_CONDUCT.md
 * -----
 * Copyright (c) 2023 Resnovas - All Rights Reserved
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
 * Last Modified: 14-04-2023
 * By: Jonathan Stevens (Email: jonathan@resnovas.com, Github: https://github.com/TGTGamer)
 * Current Version: 1.0.0-beta.7
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */

const rename = require('gulp-rename')
const exec = require('gulp-exec')
const jsonMerge = require('gulp-merge-json')
const jsonFmt = require('gulp-json-fmt')
const jsonConfig = require('gulp-json-config')
const pkg = require('gulp')
const {Testing} = require('./.gulp/testing.js')

const {src, dest, series} = pkg;

// const format = () =>
// 	src('package.json').pipe(exec('npm run xo --fix')).pipe(exec.reporter());

// Const schema = () =>
// 	src('package.json').pipe(exec('npm run schema')).pipe(exec.reporter());

const testall = series(
	Testing.copy.config,
	// Schema,
	Testing.copy.context.issue,
	Testing.run,
	Testing.copy.context.pr,
	Testing.run,
	// Testing.copy.context.project,
	// Testing.run,
	Testing.copy.context.schedule,
	Testing.run,
	Testing.package,
	// Testing.doc,
	Testing.cleanup,
);
exports.testall = testall

const release = series(
	() =>
		src('.github/config/runners/*.json')
			// .pipe(jsonConfig())
			.pipe(
				jsonMerge({
					concatArrays: true,
					fileName: 'runners.json',
					transform(parsedJson) {
						const array = [];
						array.push(parsedJson);
						return array;
					},
				}),
			)
			.pipe(jsonFmt(jsonFmt.PRETTY))
			.pipe(dest('.github/config')),
	() =>
		src('.github/config/*.json')
			.pipe(jsonConfig())
			.pipe(jsonFmt(jsonFmt.PRETTY))
			.pipe(
				rename(path => {
					path.basename = 'config';
				}),
			)
			.pipe(dest('.github')),
);

exports.default = series(release, testall, /* format */);
