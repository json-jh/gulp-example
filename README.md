## install package manager `pnpm`
```bash
npm i -g pnpm
```
## create project folder 
```bash
mkdir gulp-example
cd gulp-example
npm init -y
```
## install `tailwindcss`, `daisyui`, `sass`
```bash
pnpm install --save-dev gulp gulp-postcss postcss-cli tailwindcss autoprefixer daisyui sass gulp-sass gulp-inject
```
```json
{
  "devDependencies": {
    "daisyui": "^4.12.23",
    "gulp-postcss": "^10.0.0",
    "postcss-cli": "^11.0.0",
    "sass": "^1.83.1",
    "tailwindcss": "^3.4.17",
  }
}
```
## create tailwind config file
```bash
npx tailwindcss init
```

## create a `gulpfile.js` file in the project root 
```bash
type nul > gulpfile.js
```
- insert content into a file
  ```javascript
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
  ```

## create a `postcss.config.js` file in the project root 
```bash
type nul > postcss.config.js
```
- insert content into a file
  ```javascript
  module.exports = {
    plugins: [
      require('tailwindcss'),
      require('autoprefixer'),
    ]
  };
  ```

## initialize `tailwind.config.js`
```bash
npx tailwindcss init
```
- `tailwind.config.js`   

  ```javascript
  /** @type {import('tailwindcss').Config} */
  module.exports = {
    content: [
      './src/**/*.{html,js}',
      'node_modules/daisyui/dist/**/*.js'
    ],
    plugins: [
      require('daisyui')
    ]
  };
  ```
- src/scss/styles.scss
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```
- insert the following comment inside the `<head>` tag of your `index.html` file. The automatically generated scss file will now be imported.
  ```html
  <!-- inject:css -->
  <!-- endinject -->
  ```

## `.vscode/settings.json`
```json
{
  "css.lint.unknownAtRules": "ignore",
  "scss.lint.unknownAtRules": "ignore",
}
```

## `.vscode/extensions.json`
```json
{
  "recommendations": [
    "finntenzor.change-case",
    "usernamehw.errorlens",
    "antfu.iconify",
    "eamodio.gitlens",
    "mhutchie.git-graph",
    "ritwickdey.liveserver",
    "pkief.material-icon-theme",
    "vunguyentuan.vscode-postcss",
    "csstools.postcss",
    "sibiraj-s.vscode-scss-formatter",
    "bradlc.vscode-tailwindcss",
    "gruntfuggly.todo-tree"
  ]
}
```

## Final file structure
```bash
📁.vscode
  └ extensions.json
  └ settings.json
📁node_modules
📁src
  └📁scss
    └ styles.scss
  └ index.html
└ tailwind.config.js
└ postcss.config.js
└ gulpfile.js
└ package.json
└ README.md
```

## run gulp
```bash
npx gulp
```
- preview local browser
  - when you open vscode, install all the recommended extension apps and make sure `Live Server` is installed.
  - open the `index.html` file and click the `Go Live` button on the right side of the bottom status bar in vscode. This will launch the local server in your default browser.

## Now you can compose web pages using `daisyui` based on `tailwindcss` in `vsocde`.
- You can use `tailwindcss style classes`.
- You can use `daisyui components`. And you can `customize` them.