var changed = require('gulp-changed'),
    gulp = require('gulp');

gulp.task('images', ['svg']);

gulp.task('svg', function() {
    return gulp.src('src/images/**/*.*').pipe(gulp.dest('dist/images/'));
});

// gulp.task('tinypng', function() {
//     return gulp.src('./dist/images/**/*.{png,jpg,jpeg}')
//         .pipe(changed('./src/images/'))
//         .pipe(tinypng({
//             key: 'KtQpQekBSuPe164oHFgL4g8gtMmxRdjt',
//             sigFile: './src/images/.tinypng-sigs',
//             log: true
//         }))
//         .pipe(gulp.dest('./dist/images/'));
// });
