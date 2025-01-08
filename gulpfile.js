const gulp = require('gulp');
  const sass = require('gulp-sass')(require('sass'));
  const postcss = require('gulp-postcss');
  const tailwindcss = require('tailwindcss');
  const inject = require('gulp-inject');

  gulp.task('styles', function () {
    return gulp.src('src/scss/**/*.scss')
      .pipe(sass().on('error', sass.logError))
      .pipe(postcss([tailwindcss('tailwind.config.js'), require('autoprefixer')]))
      .pipe(gulp.dest('dist/css'));
  });

  gulp.task('html', function () {
    const target = gulp.src('./src/index.html');
    const sources = gulp.src(['dist/css/*.css'], { read: false });

    return target.pipe(inject(sources, { relative: true }))
      .pipe(gulp.dest('./src'));
  });

  gulp.task('watch', function () {
    gulp.watch('src/scss/**/*.scss', gulp.series('styles', 'html'));
  });

  gulp.task('default', gulp.series('styles', 'html', 'watch'));