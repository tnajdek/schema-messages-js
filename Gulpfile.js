/*eslint-env node */
'use strict';

var rimraf = require('rimraf');
var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var babelify = require('babelify');

gulp.task('default', function () {
	var b = browserify({
		entries: 'src/main.js',
		debug: true,
		standalone: 'MessageFactory',
		transform: [babelify]
	});

	rimraf.sync('dist/');

	return b.bundle()
		.on('error', gutil.log)
		.pipe(source('schema-messages.js'))
		.pipe(buffer())
		.pipe(gulp.dest('./dist/'))
		.pipe(uglify())
		.pipe(rename({ extname: '.min.js' }))
		.pipe(gulp.dest('./dist/'));
});
