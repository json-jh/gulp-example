/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{handlebars,html}',
    'node_modules/daisyui/dist/**/*.js'
  ],
  plugins: [
    require('daisyui'),
  ],
};
