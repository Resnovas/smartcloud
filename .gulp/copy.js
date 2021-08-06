const rename = require("gulp-rename");
const { src, dest } = require('gulp');
const exec = require('gulp-exec');

class Copy {
    static format () {
        return src('./packages/**/README-SOURCE.md')
            .pipe(rename(function (path) {
                path.basename = path.dirname;
                path.dirname = "";
                path.extname = "";
            }))
            .pipe(exec(file => `cd ${file.path} && npm run dev:format`))
            .pipe(exec.reporter({ stdout: false }));
    }

    static prettier() {
        return src('.prettier.json', { base: "." })
            .pipe(dest('packages/release-mastermind/'))
            .pipe(dest('packages/workflow-mastermind/'))
            .pipe(dest('packages/variable-mastermind/'))
            .pipe(dest('packages/convention-mastermind/'))
            .pipe(dest('packages/label-mastermind/'))
    }
    static tsconfig() {
        return src('tsconfig.json', { base: "." })
            .pipe(dest('packages/release-mastermind/'))
            .pipe(dest('packages/workflow-mastermind/'))
            .pipe(dest('packages/variable-mastermind/'))
            .pipe(dest('packages/convention-mastermind/'))
            .pipe(dest('packages/label-mastermind/'))
    }
    static docs() {
        return src('docs/**/*', { base: "." })
            .pipe(dest('packages/release-mastermind/'))
            .pipe(dest('packages/workflow-mastermind/'))
            .pipe(dest('packages/variable-mastermind/'))
            .pipe(dest('packages/convention-mastermind/'))
            .pipe(dest('packages/label-mastermind/'))
    }

    static labels() {
        return src('.github/labels.json', { base: "." })
            .pipe(dest('packages/release-mastermind'))
            .pipe(dest('packages/label-mastermind'))
            .pipe(dest('packages/convention-mastermind'))
    }

    static conditions() {
        return src('packages/release-mastermind/src/conditions/**/*')
            .pipe(dest('packages/label-mastermind/src/conditions'))
            .pipe(dest('packages/convention-mastermind/src/conditions'))
    }

    static index() {
        return src('packages/release-mastermind/src/index.ts')
            .pipe(dest('packages/label-mastermind/src'))
            .pipe(dest('packages/convention-mastermind/src'))
    }

    static action() {
        return src('packages/release-mastermind/src/action.ts')
            .pipe(dest('packages/label-mastermind/src'))
            .pipe(dest('packages/convention-mastermind/src'))
    }
    static evaluator() {
        return src('packages/release-mastermind/src/evaluator.ts')
            .pipe(dest('packages/label-mastermind/src'))
            .pipe(dest('packages/convention-mastermind/src'))
    }

    static utils() {
        return src('packages/release-mastermind/src/utils/**/*')
            .pipe(dest('packages/label-mastermind/src/utils'))
            .pipe(dest('packages/convention-mastermind/src/utils'))
    }

    static types() {
        return src('packages/release-mastermind/types/index.d.ts')
            .pipe(dest('packages/label-mastermind/types'))
            .pipe(dest('packages/convention-mastermind/types'))
    }

    static contexts() {
        return src('packages/release-mastermind/src/contexts/**/*')
            .pipe(dest('packages/label-mastermind/src/contexts'))
            .pipe(dest('packages/convention-mastermind/src/contexts'))
    }

    static templates() {
    return src('.github/ISSUE_TEMPLATE/**/*', { base: "." })
        .pipe(dest('packages/release-mastermind'))
        .pipe(dest('packages/label-mastermind'))
        .pipe(dest('packages/convention-mastermind'))
}
}

exports.Copy = Copy;