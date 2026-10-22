const tokens = require('./theme/tokens.json');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: tokens.color,
      spacing: tokens.spacing,
      fontSize: tokens.fontSize,
      borderRadius: tokens.borderRadius,
    },
  },
  plugins: [],
};
