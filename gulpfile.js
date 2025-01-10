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

function styles() {
  return gulp.src('src/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([tailwindcss('tailwind.config.js'), require('autoprefixer')]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('public/css'));
}

function scripts() {
  return gulp.src('src/js/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('public/js'));
}

function injectFiles() {
  const target = gulp.src('src/views/layouts/main.handlebars');
  const sources = gulp.src([
    'public/js/**/*.min.js', 
    'public/css/**/*.css'
  ], { read: false });
  return target
    .pipe(inject(sources, { relative: false, ignorePath: 'public/' }))
    .pipe(gulp.dest('./src/views/layouts'));
}

async function cleanFile(done) {
  function getFiles(dir, extension) {
    let results = [];
    const list = fs.readdirSync(dir);

    list.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(getFiles(filePath, extension));
      } else if (file.endsWith(extension)) {
        results.push(filePath);
      }
    });

    return results;
  }

  const cssFilesToDelete = getFiles('public/css', '.css');
  const jsFilesToDelete = getFiles('public/js', '.js');

  const deletePromises = [...cssFilesToDelete, ...jsFilesToDelete].map(async (file) => {
    const extension = path.extname(file);
    const baseFile = path.basename(file, extension);
    let sourceFile;

    if (extension === '.css') {
      sourceFile = path.join('src/scss', `${baseFile}.scss`);
      if (!fs.existsSync(sourceFile)) {
        await deleteAsync(file);
        await deleteAsync(file.replace('.css', '.css.map'));
      }
    } else if (extension === '.js') {
      sourceFile = path.join('src/js', `${baseFile}.js`);
      if (!fs.existsSync(sourceFile)) {
        await deleteAsync(file);
      }
    }
  });

  await Promise.all(deletePromises);

  done();
}

function watchFiles() {
  gulp.watch('src/scss/**/*.scss', gulp.series(cleanFile, styles, injectFiles));
  gulp.watch('src/js/**/*.js', gulp.series(cleanFile, scripts, injectFiles));
}

const build = gulp.series(gulp.parallel(styles, scripts, injectFiles, cleanFile));
gulp.task('default', gulp.series(build, watchFiles));