var requireDir = require('require-dir');

process.on('unhandledRejection', function (reason, p) {
  console.log('Possibly Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging here
});
// Require all tasks in gulp/tasks, including subfolders
requireDir('./tasks', {
  recurse: true
});
