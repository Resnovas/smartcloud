/** @format */

const mdinclude = require("mdinclude")
const toc = require("gulp-markdown-toc")
const jsonConfig = require("gulp-json-config")
const rename = require("gulp-rename")
const jsonFmt = require("gulp-json-fmt")
const { src, dest, series, parallel } = require("gulp")
const exec = require("gulp-exec")
const log = require("fancy-log")

class Testing {
	static run = () => {
		return src("package.json")
			.pipe(exec(`npm run dev:run`))
			.pipe(exec.reporter())
	}
	static package = () => {
		return src("package.json")
			.pipe(exec(`npm run dev:package`))
			.pipe(exec.reporter())
	}
	static cleanup = () => {
		return src("package.json")
			.pipe(exec(`rm config.json context.json`))
			.pipe(exec.reporter())
	}
	static copy = {
		config: () => {
			return src("contexts/config.json").pipe(dest("./"))
		},
		context: {
			issue: () => {
				return src("contexts/issue.json")
					.pipe(
						rename(function (path) {
							path.basename = "context"
						})
					)
					.pipe(dest("./"))
			},
			pr: () => {
				return src("contexts/pr.json")
					.pipe(
						rename(function (path) {
							path.basename = "context"
						})
					)
					.pipe(dest("./"))
			},
			project: () => {
				return src("contexts/project.json")
					.pipe(
						rename(function (path) {
							path.basename = "context"
						})
					)
					.pipe(dest("./"))
			},
			schedule: () => {
				return src("contexts/schedule.json")
					.pipe(
						rename(function (path) {
							path.basename = "context"
						})
					)
					.pipe(dest("./"))
			}
		}
	}
}

exports.Testing = Testing
