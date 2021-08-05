const mdinclude = require('mdinclude');
const toc = require('gulp-markdown-toc');
const jsonConfig = require('gulp-json-config');
const rename = require("gulp-rename");
const jsonFmt = require("gulp-json-fmt");
const { src, dest, series, parallel } = require('gulp');
const exec = require('gulp-exec');
const log = require('fancy-log');

class Markdown {
    static setup() {
        return src('docs/components/setup/*.md')
            .pipe(mdinclude())
            .pipe(dest('docs/components/setup'));
    }

    static conditions() {
        return src('packages/release-mastermind/src/conditions/index-source.md')
            .pipe(mdinclude())
            .pipe(rename(function (path) {
                path.basename = "index";
            }))
            .pipe(dest('packages/release-mastermind/src/conditions'));
    }

    static packageReadme() {
        return src('packages/**/README-SOURCE.md')
            .pipe(mdinclude())
            .pipe(toc())
            .pipe(rename(function (path) {
                path.basename = "README";
            }))
            .pipe(dest('packages/'));
    }

    static readme() {
        return src('README-SOURCE.md')
            .pipe(mdinclude())
            .pipe(toc())
            .pipe(rename(function (path) {
                path.basename = "README";
            }))
            .pipe(dest('.'));
    }
}

exports.Markdown = Markdown