var gulp = require('gulp');
var sass = require('gulp-sass');
// var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var rename = require('gulp-rename');
var cleanCSS = require('gulp-clean-css');

gulp.task('css', ['sass', 'minify-css', 'flag-sprite']);
// gulp.task('css', ['sass', 'flag-sprite']);

gulp.task('flag-sprite', function () {
  return gulp.src(['src/images/sprite/flags@2x.png', 'src/images/sprite/flags.png'])
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('minify-css', ['minify-css-plugin', 'minify-css-bundle']);

gulp.task('minify-css-plugin', ['sass'], function () {
  return gulp.src('./dist/css/jquery.w3w-autosuggest-plugin.css')
    .pipe(rename('jquery.w3w-autosuggest-plugin.min.css'))
    // .pipe(sourcemaps.init())
    .pipe(cleanCSS())
    // .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/css'));
});

gulp.task('minify-css-bundle', ['sass'], function () {
  return gulp.src('./dist/css/jquery.w3w-autosuggest-plugin.bundle.css')
    .pipe(rename('jquery.w3w-autosuggest-plugin.bundle.min.css'))
    // .pipe(sourcemaps.init())
    .pipe(cleanCSS())
    // .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/css'));
});

gulp.task('sass', ['sass-plugin', 'sass-bundle']);

gulp.task('sass-plugin', function (done) {
  var input = ['./src/scss/**/jquery.w3w-autosuggest-plugin.scss'];
  var output = './dist/css/';

  var sassOptions = {
    errLogToConsole: true,
    outputStyle: 'expanded'
  };

  return gulp.src(input)
    // .pipe(sourcemaps.init())
    .pipe(sass(sassOptions).on('error', sass.logError))
    // .pipe(sourcemaps.write())
    .pipe(autoprefixer())
    .pipe(gulp.dest(output));
});

gulp.task('sass-bundle', function (done) {
  var input = ['./src/scss/**/jquery.w3w-autosuggest-plugin.bundle.scss'];
  var output = './dist/css/';

  var sassOptions = {
    errLogToConsole: true,
    outputStyle: 'expanded'
  };

  return gulp.src(input)
    // .pipe(sourcemaps.init())
    .pipe(sass(sassOptions).on('error', sass.logError))
    // .pipe(sourcemaps.write())
    .pipe(autoprefixer())
    .pipe(gulp.dest(output));
});
