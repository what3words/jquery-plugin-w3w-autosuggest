var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('js-build', ['jsminify', 'js-bundle-min']);

gulp.task('jsminify', function () {
  return gulp.src(['src/js/jquery.w3w-autosuggest-plugin.js'])
    .pipe(sourcemaps.init())
    .pipe(gulp.dest('dist/js'))
    .pipe(rename('jquery.w3w-autosuggest-plugin.min.js'))
    .pipe(uglify({
      outSourceMap: true
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('js-bundle-min', ['js-bundle'], function () {
  return gulp.src('dist/js/jquery.w3w-autosuggest-plugin.bundle.js')
  .pipe(sourcemaps.init())
  .pipe(gulp.dest('dist/js'))
  .pipe(rename('jquery.w3w-autosuggest-plugin.bundle.min.js'))
  .pipe(uglify({
    outSourceMap: true
  }))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('dist/js'));
});

gulp.task('js-bundle', function () {
  return gulp.src(['src/js/jquery.w3w-autosuggest-plugin.js',
    'node_modules/jquery-typeahead/dist/jquery.typeahead.min.js',
    'node_modules/jquery-validation/dist/jquery.validate.min.js'
  ])
  .pipe(concat('jquery.w3w-autosuggest-plugin.bundle.js'))
  .pipe(gulp.dest('dist/js'));
});
