var gulp = require('gulp');
var del = require('del');

gulp.task('clean', ['clean-build', 'clean-dist']);

gulp.task('clean-build', function () {
  return del([
    'build'
  ]);
});

gulp.task('clean-dist', function () {
  return del([
    'dist'
  ]);
});

gulp.task('clean-osx', function () {
  return del([
    '**/.DS_Store'
  ]);
});
