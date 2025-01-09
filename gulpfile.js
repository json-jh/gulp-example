const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const tailwindcss = require('tailwindcss');
const inject = require('gulp-inject');
const path = require('path');
const fs = require('fs');
const { deleteAsync } = require('del');

const paths = {
  tailwindConfigJs: 'tailwind.config.js',
  public: 'public',
  scss: 'src/scss/**/*.scss',
  js: 'src/js/**/*.js',
  handlebars: 'src/js/**/*.handlebars',
  publicCss: 'public/css',
  publicJs: 'public/js',
  srcScss: 'src/scss',
  mainHandlebars: 'src/views/layouts/main.handlebars',
  srcViewsLayouts: './src/views/layouts'
};

function styles() {
  return gulp.src(paths.scss)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([tailwindcss(paths.tailwindConfigJs), require('autoprefixer')]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.publicCss));
}

function scripts() {
  return gulp.src(paths.js)
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.publicJs));
}

function injectFiles() {
  const target = gulp.src(paths.mainHandlebars);
  const sources = gulp.src([`${paths.publicJs}/*.min.js`, `${paths.publicCss}/*.css`], { read: false });
  return target
    .pipe(inject(sources, { relative: false, ignorePath: 'public/' }))
    .pipe(gulp.dest(paths.srcViewsLayouts));
}

async function cleanCss(done) {
  const publicCssFiles = fs.readdirSync(paths.publicCss).filter(file => file.endsWith('.css'));

  const cssFilesToDelete = publicCssFiles.map(file => {
    return path.join(paths.publicCss, file);
  });

  const deletePromises = cssFilesToDelete.map(async (cssFile) => {
    const scssFile = path.join(paths.srcScss, path.basename(cssFile.replace('.css', '.scss')));
    if (!fs.existsSync(scssFile)) {
      await deleteAsync(cssFile);
      await deleteAsync(cssFile.replace('.css', '.css.map'));
      
    }
  });

  await Promise.all(deletePromises);

  done();
}

async function cleanJs(done) {
  const publicJsFiles = fs.readdirSync(paths.publicJs).filter(file => file.endsWith('.min.js'));

  const filesToDelete = publicJsFiles.map(file => {
    return path.join(paths.publicJs, file);
  });

  const deletePromises = filesToDelete.map(async (file) => {
    const syncFile = path.join(paths.srcScss, path.basename(file.replace('.min.js', '.js')));
    if (!fs.existsSync(syncFile)) {
      await deleteAsync(file);
      await deleteAsync(file.replace('.min.js', '.min.js.map'));
      
    }
  });

  await Promise.all(deletePromises);

  done();
}

function watchFiles() {
  gulp.watch(paths.scss, gulp.series(cleanCss, styles, injectFiles));
  gulp.watch(paths.js, gulp.series(cleanJs, scripts, injectFiles));
}

const build = gulp.series(gulp.parallel(styles, scripts, injectFiles, cleanCss, cleanJs));
gulp.task('default', gulp.series(build, watchFiles));