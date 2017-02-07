var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	source = require('vinyl-source-stream'),
	browserify = require('browserify');
	streamify = require('gulp-streamify');

//the core bundle for our application
gulp.task('browserify', function(cb) {
   browserify('./src/js/jquery.w3w-autosuggest-plugin.js')
      .bundle()
      .pipe(source('jquery.w3w-autosuggest-plugin.js'))
      // .pipe(streamify(uglify()))
      .pipe(gulp.dest('./dist/js/'))
      .on('end', cb);
});

//the core bundle for our application
gulp.task('browserify-min', function(cb) {
   browserify('./src/js/jquery.w3w-autosuggest-plugin.js')
      .bundle()
      .pipe(source('jquery.w3w-autosuggest-plugin-min.js'))
      .pipe(streamify(uglify()))
      .pipe(gulp.dest('./dist/js/'))
      .on('end', cb);
});
