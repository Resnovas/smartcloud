const mdinclude = require('mdinclude');
const toc = require('gulp-markdown-toc');
const jsonConfig = require('gulp-json-config');
const rename = require("gulp-rename");
const jsonFmt = require("gulp-json-fmt");
const { src, dest, series, parallel } = require('gulp');

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
    return src('packages/release-mastermind/src/conditions/**/*', { base: "." })
        .pipe(dest('packages/release-mastermind/src/conditions'))
        .pipe(dest('packages/label-mastermind/src/conditions'))
        .pipe(dest('packages/convention-mastermind/src/conditions'))
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

function release() {
    return src('packages/release-mastermind/.github/config/*.json')
        .pipe(jsonConfig())
        .pipe(jsonFmt(jsonFmt.PRETTY))
        .pipe(dest('packages/release-mastermind/.github/'))
}

function convention() {
    return src('packages/convention-mastermind/.github/config/*.json')
        .pipe(jsonConfig())
        .pipe(jsonFmt(jsonFmt.PRETTY))
        .pipe(dest('packages/convention-mastermind/.github/'))
}

function copyLabels() {
    return src('packages/label-mastermind/.github/config/*.json')
        .pipe(jsonConfig())
        .pipe(jsonFmt(jsonFmt.PRETTY))
        .pipe(dest('packages/label-mastermind/.github/'))
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

exports.default = series(createSetup, createConditions, parallel(copyDocs, copyConditions, copyLabels, copyTemplates), parallel(release, convention), createReadMe);
