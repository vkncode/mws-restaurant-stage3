// Gulp.js configuration
var gulp = require('gulp');
var resize = require('gulp-image-resize');
var rename = require('gulp-rename');

gulp.task('default',['resize-small','resize-medium','resize-large']);

gulp.task('resize-small', function () {
  return gulp.src('./img/*.jpg')
    .pipe(resize({
        width: 375,     
        height: 280,
        crop: true,
        upscale: false,
        quality: 0.5,
        progressive: true,
        withMetadata: false
    }))
    .pipe(rename({ suffix: '_small', extname: '.jpg' }))
    .pipe(gulp.dest('./destimg'));
});

gulp.task('resize-medium', function () {
  return gulp.src('./img/*.jpg')
  .pipe(resize({
      width: 480,     
      height: 360,
      crop: true,
      upscale: false,
      quality: 0.5,
      progressive: true,
      withMetadata: false
  }))
  .pipe(rename({ suffix: '_medium', extname: '.jpg' }))
  .pipe(gulp.dest('./destimg'));
});

gulp.task('resize-large', function () {
  return gulp.src('./img/*.jpg')
.pipe(resize({
  width: 800,     
  height: 600,
  crop: true,
  upscale: false,
  quality: 0.5,
  progressive: true,
  withMetadata: false
}))
.pipe(rename({ suffix: '_large', extname: '.jpg' }))
.pipe(gulp.dest('./destimg'));
});