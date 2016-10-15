'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');
const copy = require('gulp-copy');
const uglify = require('gulp-uglify');
const watch = require('gulp-watch');

gulp.task('copy', () => {
  return gulp.src('static/**/*')
    .pipe(copy('dist', { prefix: 1 }));
});

gulp.task('scripts', () => {
  return gulp.src(['src/js/background.js', 'src/js/popup.js'])
    .pipe(babel({ presets: ['es2015']}))
    .pipe(uglify().on('error', e => console.log(e)))
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', () => {
  gulp.watch('src/**/*', ['scripts']);
});

gulp.task('default', ['scripts', 'watch']);
