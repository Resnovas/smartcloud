const mdinclude = require('mdinclude');
const toc = require('gulp-markdown-toc');
const { src, dest, series } = require('gulp');

function createComponents() {
    return src('docs/components/setup/*.md')
        .pipe(mdinclude())
        .pipe(dest('docs/components/setup'));
}

function createReadMe() {
    return src('docs/readme/*.md')
        .pipe(mdinclude())
        .pipe(toc())
        .pipe(dest('docs/output/'));
}

exports.default = series(createComponents, createReadMe);
