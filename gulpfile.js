const mdinclude = require('mdinclude');
const toc = require('gulp-markdown-toc');
const jsonConfig = require('gulp-json-config');
const rename = require("gulp-rename");
const jsonFmt = require("gulp-json-fmt");
const { src, dest, series, parallel } = require('gulp');
const exec = require('gulp-exec');
const log = require('fancy-log');

function createSetup() {
    return src('docs/components/setup/*.md')
        .pipe(mdinclude())
        .pipe(dest('docs/components/setup'));
}

function createConditions() {
    return src('packages/release-mastermind/src/conditions/index-source.md')
        .pipe(mdinclude())
        .pipe(rename(function (path) {
            path.basename = "index";
        }))
        .pipe(dest('packages/release-mastermind/src/conditions'));
}

function copyDocs() {
    return src('docs/**/*', { base: "." })
        .pipe(dest('packages/release-mastermind/'))
        .pipe(dest('packages/workflow-mastermind/'))
        .pipe(dest('packages/variable-mastermind/'))
        .pipe(dest('packages/convention-mastermind/'))
        .pipe(dest('packages/label-mastermind/'))
}

function copyConditions() {
    return src('packages/release-mastermind/src/conditions/**/*')
        .pipe(dest('packages/label-mastermind/src/conditions'))
        .pipe(dest('packages/convention-mastermind/src/conditions'))
}
function copyIndex() {
    return src('packages/release-mastermind/src/index.ts')
        .pipe(dest('packages/label-mastermind/src'))
        .pipe(dest('packages/convention-mastermind/src'))
}
function copyUtils() {
    return src('packages/release-mastermind/src/utils/**/*')
        .pipe(dest('packages/label-mastermind/src/utils'))
        .pipe(dest('packages/convention-mastermind/src/utils'))
}
function copyTypes() {
    return src('packages/release-mastermind/types/global.d.ts')
        .pipe(dest('packages/label-mastermind/types'))
        .pipe(dest('packages/convention-mastermind/types'))
}

function copyLabels() {
    return src('.github/labels.json', { base: "." })
        .pipe(dest('packages/release-mastermind'))
        .pipe(dest('packages/label-mastermind'))
        .pipe(dest('packages/convention-mastermind'))
}

function copyTemplates() {
    return src('.github/ISSUE_TEMPLATE/**/*', { base: "." })
        .pipe(dest('packages/release-mastermind'))
        .pipe(dest('packages/label-mastermind'))
        .pipe(dest('packages/convention-mastermind'))
}

function createAllConfig() {
    return src('.github/config/*.json')
        .pipe(jsonConfig())
        .pipe(jsonFmt(jsonFmt.PRETTY))
        .pipe(rename(function (path) {
            path.basename = "allconfigs";
        }))
        .pipe(dest('.github/'))
}

function release() {
    return releaseConfig()
}
function releaseConfig() {
    return src('packages/release-mastermind/.github/config/*.json')
        .pipe(jsonConfig())
        .pipe(jsonFmt(jsonFmt.PRETTY))
        .pipe(dest('packages/release-mastermind/.github/'))
        .pipe(rename(function (path) {
            path.basename = "releaseMastermind";
        }))
        .pipe(dest('.github/config'))
}

function convention() {
    return conventionConfig()
}
function conventionConfig() {
    return src('packages/convention-mastermind/.github/config/*.json')
        .pipe(jsonConfig())
        .pipe(jsonFmt(jsonFmt.PRETTY))
        .pipe(dest('packages/convention-mastermind/.github/'))
        .pipe(rename(function (path) {
            path.basename = "conventionMastermind";
        }))
        .pipe(dest('.github/config'))
}
function labels() {
    return labelsConfig()
}
function labelsConfig() {
    return src('packages/label-mastermind/.github/config/*.json')
        .pipe(jsonConfig())
        .pipe(jsonFmt(jsonFmt.PRETTY))
        .pipe(dest('packages/label-mastermind/.github/'))
        .pipe(rename(function (path) {
            path.basename = "labelMastermind";
        }))
        .pipe(dest('.github/config'))
}

function createReadMe() {
    return src('packages/**/README-SOURCE.md')
        .pipe(mdinclude())
        .pipe(toc())
        .pipe(rename(function (path) {
            path.basename = "README";
        }))
        .pipe(dest('packages/'));
}

function createreadme() {
    return src('README-SOURCE.md')
        .pipe(mdinclude())
        .pipe(toc())
        .pipe(rename(function (path) {
            path.basename = "README";
        }))
        .pipe(dest('.'));
}

function copyConfig() {
    return src('config.json')
        .pipe(dest('packages/release-mastermind'))
        .pipe(dest('packages/label-mastermind'))
        .pipe(dest('packages/convention-mastermind'))
}
function copyContextIssue() {
    return src('contexts/issue.json')
        .pipe(rename(function (path) {
            path.basename = "context";
        }))
        .pipe(dest('packages/release-mastermind'))
        .pipe(dest('packages/label-mastermind'))
        .pipe(dest('packages/convention-mastermind'))
}
function copyContextPR() {
    return src('contexts/pr.json')
        .pipe(rename(function (path) {
            path.basename = "context";
        }))
        .pipe(dest('packages/release-mastermind'))
        .pipe(dest('packages/label-mastermind'))
        .pipe(dest('packages/convention-mastermind'))
}
function copyContextProject() {
    return src('contexts/project.json')
        .pipe(rename(function (path) {
            path.basename = "context";
        }))
        .pipe(dest('packages/release-mastermind'))
        .pipe(dest('packages/label-mastermind'))
        .pipe(dest('packages/convention-mastermind'))
}

function test() {
    return src('./packages/**/README-SOURCE.md')
        .pipe(rename(function (path) {
            path.basename = path.dirname;
            path.dirname = "";
            path.extname = "";
        }))
        .pipe(exec(file => `cd ${file.path} && npm run dev:run`))
        .pipe(exec.reporter({ stdout: false }));
}

function cleanup() {
    return src('./packages/**/README-SOURCE.md')
        .pipe(rename(function (path) {
            path.basename = path.dirname;
            path.dirname = "";
            path.extname = "";
        }))
        .pipe(exec(file => `cd ${file.path} && del config.json context.json`))
        .pipe(exec.reporter());
}

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
    package,
    parallel(copyConfig, copyContextIssue),
    test,
    copyContextPR,
    test,
    // copyContextProject,
    // test,
    cleanup
);

exports.default = series(
    parallel(createSetup, createConditions),
    parallel(copyIndex, copyDocs, copyConditions, copyLabels, copyTypes, copyUtils, copyTemplates),
    parallel(release, convention, labels),
    testall,
    createAllConfig,
    createReadMe,
    createreadme
)

exports.testall = testall
exports.package = package