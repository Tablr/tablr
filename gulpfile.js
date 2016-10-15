'use strict';

const gulp = require('gulp');
const babelify = require('babelify');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const copy = require('gulp-copy');
const source = require('vinyl-source-stream');
const watch = require('gulp-watch');

gulp.task('copy', () => {
  return gulp.src('static/**/*')
    .pipe(copy('dist', { prefix: 1 }));
});

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

gulp.task('watch', () => {
  gulp.watch('src/**/*', ['js1', 'js2']);
});

gulp.task('default', ['js1', 'js2', 'watch']);
