const rename = require("gulp-rename");
const { src, series, parallel } = require('gulp');
const exec = require('gulp-exec');
const { Copy } = require('./.gulp/copy')
const { Markdown } = require('./.gulp/markdown')
const { Testing } = require('./.gulp/testing')
const { Configs } = require('./.gulp/configs')

function package() {
    return src('./packages/**/README-SOURCE.md')
        .pipe(rename(function (path) {
            path.basename = path.dirname;
            path.dirname = "";
            path.extname = "";
        }))
        .pipe(exec(file => `cd ${file.path} && npm run dev:package`))
        .pipe(exec.reporter());
}

const testall = series(
    parallel(Testing.copy.config, Testing.copy.context.issue),
    Testing.run,
    Testing.copy.context.pr,
    Testing.run,
    // Testing.copy.context.project,
    // Testing.run,
    Testing.copy.context.schedule,
    Testing.run,
    Testing.cleanup,
    package
);

exports.default = series(
    parallel(Copy.index, Copy.action, Copy.evaluator, Copy.contexts, Copy.docs, Copy.conditions, Copy.labels, Copy.types, Copy.utils, Copy.templates),
    parallel(Configs.release, Configs.convention, Configs.labels),
    Copy.format,
    testall,
    Configs.allConfig,
    parallel(Markdown.setup, Markdown.conditions),
    Markdown.packageReadme,
    Markdown.readme,
    Copy.format,
)

exports.testall = testall
exports.package = package