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