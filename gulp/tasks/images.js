var gulp = require('gulp');
// var imagemin = require('gulp-imagemin');
// var glue;
// try {
//   glue = require('gulp-glue');
// } catch (e) {}

gulp.task('images', ['imagemin']);

gulp.task('imagemin', ['icon'], function (done) {
  console.log('do no use, as sprite is not responsive');
  // return gulp.src('src/images/sprite/flags.png')
  //   .pipe(imagemin())
  //   .pipe(gulp.dest('src/images/sprite/flags.png'));
});

gulp.task('icon', function (done) {
  console.log('do no use, as sprite is not responsive');
  // if (typeof glue === 'undefined') {
  //   console.log('gulp-glue is not installed');
  //   done();
  // } else {
  //   gulp
  //     .src('nothing')
  //     .pipe(glue({
  //       source: 'src/images/flags', // required
  //       output: 'src/images/sprite', // required
  //       scss: 'src/images/sprite',
  //       namespace: 'w3w',
  //       retina: true,
  //       png8: true,
  //       url: '',
  //       css: true,
  //       html: true
  //     }, function () {
  //       done();
  //     }));
  // }
});
