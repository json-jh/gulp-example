/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,js}',
    'node_modules/daisyui/dist/**/*.js'
  ],
  plugins: [
    require('daisyui'),
  ],
};
