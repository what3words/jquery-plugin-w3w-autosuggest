var changed = require('gulp-changed'),
    gulp = require('gulp');

gulp.task('images', ['svg']);

gulp.task('svg', function() {
    return gulp.src('src/images/**/*.*').pipe(gulp.dest('dist/images/'));
});