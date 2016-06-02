'use strict';

var gulp    = require('gulp');
var plugins = require('gulp-load-plugins')();

var paths = {
  sourceFiles: 'lib/**/*.js',
  testFiles: 'test/**/*.js',
  gulpFile: 'gulpfile.js'
};

gulp.task('cover', function () {
  return gulp.src(paths.sourceFiles)
    .pipe(plugins.istanbul());
});

gulp.task('test', ['cover'], function () {
  gulp.src('./coverage')
    .pipe(plugins.clean());

  var options = {
    dir: './coverage',
    reporters: ['lcov', 'json'],
    reportOpts: { dir: './coverage' }
  };

  return gulp.src(paths.sourceFiles)
    .pipe(plugins.istanbul())
    .pipe(plugins.istanbul.hookRequire())
    .on('finish', function () {
      gulp.src(paths.testFiles)
        .pipe(plugins.mocha({ reporter: 'spec' }))
        .pipe(plugins.istanbul.writeReports(options))
        .pipe(plugins.exit(1));
    });
});

gulp.task('enforce', function () {
  return gulp.src('.')
    .pipe(plugins.istanbulEnforcer({
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100
      },
      coverageDirectory: 'coverage',
      rootDirectory: '.'
    }))
    .on('error', function (error) {
      console.log(error.message); // eslint-disable-line no-console
      process.exit(1);
    })
    .pipe(plugins.exit());
});

gulp.task('coveralls', function () {
  gulp.src('coverage/**/lcov.info')
    .pipe(plugins.coveralls());
});
