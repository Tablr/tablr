'use strict';

const gulp = require('gulp');
const babelify = require('babelify');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');

gulp.task('js1', () => {
  let bundler = browserify('src/js/popup.js');
  bundler.transform(babelify);
  bundler.bundle()
    .on('error', err => console.error(err))
    .pipe(source('popup.js'))
    .pipe(buffer())
    .pipe(gulp.dest('dist'));
});

gulp.task('js2', () => {
  let bundler = browserify('src/js/background.js');
  bundler.transform(babelify);
  bundler.bundle()
    .on('error', err => console.error(err))
    .pipe(source('background.js'))
    .pipe(buffer())
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['js1', 'js2']);
