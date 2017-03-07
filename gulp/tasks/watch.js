/* Notes:
   - gulp/tasks/browserify.js handles js recompiling with watchify
   - gulp/tasks/browserSync.js automatically reloads any files
     that change within the directory it's serving from
*/

var gulp = require('gulp');

gulp.task('watch', function () {
  gulp.watch('./src/css/scss/**/*.scss', ['css']);
  gulp.watch('./src/js/*.js', ['js-build']);
});
