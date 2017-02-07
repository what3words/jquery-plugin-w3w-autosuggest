var gulp = require('gulp');
var scp = require('gulp-scp2');
var localConfigPath = './local.config.js';
var localConfigSamplePath = './local.config.sample.js';
var localConfig;
try {
  localConfig = require(localConfigPath);
} catch (e) {
  localConfig = require(localConfigSamplePath);
}


gulp.task('scp', function() {
  return gulp.src('./../../dist/**/*', {
      cwd: __dirname
    })
    .pipe(scp({
      host: localConfig.remote.host,
      username: localConfig.remote.user,
      agent: process.env["SSH_AUTH_SOCK"],
      agentForward: true,
      dest: localConfig.remote.dest,
      watch: function(client) {
        client.on('write', function(o) {
          console.log('write %s', o.destination);
        });
      }
    }))
    .on('error', function(err) {
      console.log(err);
    });
});

gulp.task('scpmin', function() {
  return gulp.src(['./../../dist/**/*', '!./../../dist/geoip/**/*'], {
      cwd: __dirname
    })
    .pipe(scp({
      host: localConfig.remote.host,
      username: localConfig.remote.user,
      agent: process.env["SSH_AUTH_SOCK"],
      agentForward: true,
      dest: localConfig.remote.dest,
      watch: function(client) {
        client.on('write', function(o) {
          console.log('write %s', o.destination);
        });
      }
    }))
    .on('error', function(err) {
      console.log(err);
    });
});
