/** @format */

const rename = require("gulp-rename")
const { src, series, parallel, dest } = require("gulp")
const exec = require("gulp-exec")
const { Testing } = require("./.gulp/testing")
const jsonMerge = require("gulp-merge-json")
const jsonFmt = require("gulp-json-fmt")
const jsonConfig = require("gulp-json-config")

const testall = series(
	Testing.copy.config,
	Testing.copy.context.issue,
	Testing.run,
	Testing.copy.context.pr,
	Testing.run,
	Testing.copy.context.project,
	Testing.run,
	Testing.copy.context.schedule,
	Testing.run,
	Testing.cleanup,
	Testing.package
)

const format = () => {
	return src("package.json")
		.pipe(exec(`npm run dev:format`))
		.pipe(exec.reporter())
}

const schema = () => {
	return src("package.json")
		.pipe(exec(`npm run dev:schema`))
		.pipe(exec.reporter())
}

const release = series(
	() => {
		return (
			src(".github/config/runners/*.json")
				// .pipe(jsonConfig())
				.pipe(
					jsonMerge({
						concatArrays: true,
						fileName: "runners.json",
						transform: (parsedJson) => {
							const array = []
							array.push(parsedJson)
							return array
						}
					})
				)
				.pipe(jsonFmt(jsonFmt.PRETTY))
				.pipe(dest(".github/config"))
		)
	},
	() => {
		return src(".github/config/*.json")
			.pipe(jsonConfig())
			.pipe(jsonFmt(jsonFmt.PRETTY))
			.pipe(
				rename(function (path) {
					path.basename = "config"
				})
			)
			.pipe(dest(".github"))
	}
)

exports.default = series(release, schema, testall, format)

exports.testall = testall
