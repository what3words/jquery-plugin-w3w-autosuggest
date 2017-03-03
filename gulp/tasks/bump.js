var gulp = require('gulp');
var bump = require('gulp-bump');
var args = require('yargs').argv;

gulp.task('bump', function () {
  /// <summary>
  /// It bumps revisions
  /// Usage:
  /// 1. gulp bump : bumps the package.json and bower.json to the next minor revision.
  ///   i.e. from 0.1.1 to 0.1.2
  /// 2. gulp bump --vers 1.1.1 : bumps/sets the package.json to the specified revision.
  /// 3. gulp bump --type major       : bumps 1.0.0
  ///    gulp bump --type minor       : bumps 0.1.0
  ///    gulp bump --type patch       : bumps 0.0.2
  ///    gulp bump --type prerelease  : bumps 0.0.1-2
  /// </summary>

  var type = args.type;
  var version = args.vers;
  var options = {};
  if (version) {
    options.version = version;
  } else {
    options.type = type;
  }
  var sources = ['./package.json', 'src/js/jquery.w3w-autosuggest-plugin.js'];
  return gulp.src(sources, {base: './'})
    .pipe(bump(options))
    .pipe(gulp.dest('./'));
});
