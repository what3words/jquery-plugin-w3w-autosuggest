var gulp = require('gulp');

gulp.task('markup', ['html_files']);

gulp.task('html_files', function(cb) {
  gulp.src(['src/*.html']).pipe(gulp.dest('dist/')).on('end', cb) ;
});
