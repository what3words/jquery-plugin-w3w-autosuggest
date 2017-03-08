var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('js-build', ['jsminify', 'js-bundle-min']);

var minify = function (source, destination) {
  return gulp.src(source)
    .pipe(sourcemaps.init())
    .pipe(gulp.dest('dist/js'))
    .pipe(rename(destination))
    .pipe(uglify({
      outSourceMap: true
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/js'));
};

gulp.task('jsminify', ['lint'], function () {
  return minify('src/js/jquery.w3w-autosuggest-plugin.js',
    'jquery.w3w-autosuggest-plugin.min.js');
});

gulp.task('js-bundle-min', ['js-bundle'], function () {
  return minify('dist/js/jquery.w3w-autosuggest-plugin.bundle.js',
  'jquery.w3w-autosuggest-plugin.bundle.min.js');
});

gulp.task('js-bundle', ['lint'], function () {
  var sources = [
    'src/js/jquery.w3w-autosuggest-plugin.js',
    'node_modules/jquery-typeahead/dist/jquery.typeahead.min.js',
    'node_modules/jquery-validation/dist/jquery.validate.min.js'
  ];
  return gulp.src(sources)
    .pipe(concat('jquery.w3w-autosuggest-plugin.bundle.js'))
    .pipe(gulp.dest('dist/js'));
});
