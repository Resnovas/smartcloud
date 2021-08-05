const mdinclude = require('mdinclude');
const toc = require('gulp-markdown-toc');
const jsonConfig = require('gulp-json-config');
const rename = require("gulp-rename");
const jsonFmt = require("gulp-json-fmt");
const { src, dest, series, parallel } = require('gulp');
const exec = require('gulp-exec');
const log = require('fancy-log');

class Testing {
    static run () {
        return src('./packages/**/README-SOURCE.md')
            .pipe(rename(function (path) {
                path.basename = path.dirname;
                path.dirname = "";
                path.extname = "";
            }))
            .pipe(exec(file => `cd ${file.path} && npm run dev:run`))
            .pipe(exec.reporter({ stdout: false }));
    }

    static cleanup() {
        return src('./packages/**/README-SOURCE.md')
            .pipe(rename(function (path) {
                path.basename = path.dirname;
                path.dirname = "";
                path.extname = "";
            }))
            .pipe(exec(file => `cd ${file.path} && del config.json context.json`))
            .pipe(exec.reporter());
    }

    static copy = {
        config: () => {
            return src('config.json')
                .pipe(dest('packages/release-mastermind'))
                .pipe(dest('packages/label-mastermind'))
                .pipe(dest('packages/convention-mastermind'))
        },
        context: {
            issue: () => {
                return src('contexts/issue.json')
                    .pipe(rename(function (path) {
                        path.basename = "context";
                    }))
                    .pipe(dest('packages/release-mastermind'))
                    .pipe(dest('packages/label-mastermind'))
                    .pipe(dest('packages/convention-mastermind'))
            },
            pr: () => {
                return src('contexts/pr.json')
                    .pipe(rename(function (path) {
                        path.basename = "context";
                    }))
                    .pipe(dest('packages/release-mastermind'))
                    .pipe(dest('packages/label-mastermind'))
                    .pipe(dest('packages/convention-mastermind'))
            },
            project: () => {
                return src('contexts/project.json')
                    .pipe(rename(function (path) {
                        path.basename = "context";
                    }))
                    .pipe(dest('packages/release-mastermind'))
                    .pipe(dest('packages/label-mastermind'))
                    .pipe(dest('packages/convention-mastermind'))
            },
            schedule: () => {
                return src('contexts/schedule.json')
                    .pipe(rename(function (path) {
                        path.basename = "context";
                    }))
                    .pipe(dest('packages/release-mastermind'))
                    .pipe(dest('packages/label-mastermind'))
                    .pipe(dest('packages/convention-mastermind'))
            }
        }
    }
}

exports.Testing = Testing;