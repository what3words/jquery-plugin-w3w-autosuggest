var gulp = require('gulp');

gulp.task('build', ['markup', 'sass', 'browserify', 'browserify-min', 'images']);