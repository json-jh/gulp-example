## introduction
This document guides you through setting up an environment that can create web pages using `tailwindcss` and `daisyui` based on `gulp`.

## Features
- Provides an environment (hot-reload) where you can check changes in the browser in real time when modifying a file.
- Static resources can be specified, and there is no need to register them manually.
- Router function is provided.
- Markups can be separated/combined (componentized).
- Has a structure that is advantageous for collaboration.
- Files created and deleted in the `/src` folder are exactly synchronized to the `/public` folder. No need to manage them manually.
- If you can't use react, vue, angular, this environment can be flexible in building and delivering UI/UX.

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
pnpm install --save-dev gulp gulp-postcss postcss-cli tailwindcss autoprefixer daisyui sass gulp-sass gulp-inject gulp-uglify gulp-rename gulp-sourcemaps del concurrently nodemon browser-sync
```
```bash
pnpm install express express-handlebars
```
```json
{
  "devDependencies": {
    "autoprefixer": "^10.4.20",
    "browser-sync": "^3.0.3",
    "concurrently": "^9.1.2",
    "daisyui": "^4.12.23",
    "del": "^8.0.0",
    "gulp": "^5.0.0",
    "gulp-if": "^3.0.0",
    "gulp-inject": "^5.0.5",
    "gulp-postcss": "^10.0.0",
    "gulp-rename": "^2.0.0",
    "gulp-sass": "^6.0.0",
    "gulp-sourcemaps": "^3.0.0",
    "gulp-uglify": "^3.0.2",
    "nodemon": "^3.1.9",
    "postcss-cli": "^11.0.0",
    "sass": "^1.83.1",
    "tailwindcss": "^3.4.17"
  },
  "dependencies": {
    "express": "^4.21.2",
    "express-handlebars": "^8.0.1"
  }
}
```
## create tailwind config file
```bash
npx tailwindcss init
```

## create a `gulpfile.js` file in the project root 
```bash
type null > gulpfile.js
```
- insert content into a file
  ```javascript
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
  ```
  - insert the following comment inside the `<head>` tag of your `main.handlebars` file. The automatically generated scss file will now be imported.
  ```html
  <!-- inject:css -->
  <!-- endinject -->
  ```
  - insert the following comment at the end of the `<body>` tag in the `main.handlebars` file. The automatically generated scss file will now import it.
  ```html
  <!-- inject:js -->
  <!-- endinject -->
  ```
## create a `postcss.config.js` file in the project root 
```bash
type null > postcss.config.js
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
      './src/**/*.{html,js,handlebars}',
      'node_modules/daisyui/dist/**/*.js'
    ],
    plugins: [
      require('daisyui'),
    ],
  };
  ```
- src/scss/styles.scss
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```

## `.vscode/settings.json`
```json
{
  "css.lint.unknownAtRules": "ignore",
  "scss.lint.unknownAtRules": "ignore",
}
```

## initialize express server for routing
```bash
type null > server.js
```
  ```js
  const express = require('express');
  const { engine } = require('express-handlebars');
  const browserSync = require('browser-sync');
  const path = require('path');

  const server = express();
  const bs = browserSync.create();

  server.use(express.static(path.join(process.cwd(), 'public')));

  server.engine('handlebars', engine());
  server.set('view engine', 'handlebars');
  server.set('views', path.join(process.cwd(), 'src/views'));

  server.get('/', (req, res) => {
      res.render('index', { title: 'GULP EXAMPLE' });
  });
  server.get('/smile', (req, res) => {
      res.render('smile', { title: 'GULP EXAMPLE' });
  });
  // Keep adding paths here. The first argument to the `res.render()` function is the `handlebars` file name.

  const PORT = process.env.PORT || 5001;
  server.listen(PORT, () => {
    console.log(`🖥️ server running on http://localhost:${PORT}`);
    bs.init({
        proxy: `http://localhost:${PORT}`,
        files: ['src/**/*', 'public/**/*'],
        port: 3000,
        open: false,
        notify: false
    });
  });

  server.on('restart', () => {
    bs.reload();
  });
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
  └ ...
📁public
  └ 📁css
    └ ...(Auto-generated)
  └ 📁js
    └ ...(Auto-generated)
📁src
  └📁scss
    └ globals.scss
    └ layout.scss
  └📁js
    └ ...
  └📁views
    └📁components
      └ ...
    └📁layouts
      └ main.handlebars
    └📁partials
      └ header.handlebars
      └ footer.handlebars
    └ index.handlebars
└ tailwind.config.js
└ postcss.config.js
└ gulpfile.js
└ package.json
└ README.md
```

## run gulp
```bash
pnpm start
```

## Now you can compose web pages using `daisyui` based on `tailwindcss` in `vsocde`.
- You can use `tailwindcss style classes`.
- You can use `daisyui components`. And you can `customize` them.

## Reference
- 🔗 [https://daisyui.com/components/](https://daisyui.com/components/)
- 🔗 [https://tailwindcss.com/docs/installation](https://tailwindcss.com/docs/installation)

