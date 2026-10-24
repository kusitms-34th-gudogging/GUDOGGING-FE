// tokens/tailwind-token.json 은 `pnpm tokens:build` 로 생성되는 파일 (직접 수정 금지)
const plugin = require('tailwindcss/plugin');

const tokens = require('./tokens/tailwind-token.json');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      spacing: tokens.spacing,
      borderRadius: tokens.borderRadius,
      fontSize: tokens.fontSize,
      fontFamily: tokens.fontFamily,
      fontWeight: tokens.fontWeight,
      colors: tokens.colors,
      width: tokens.size,
      height: tokens.size,
      size: tokens.size,
      minWidth: tokens.size,
      minHeight: tokens.size,
      borderWidth: tokens.borderWidth,
      opacity: tokens.opacity,
      boxShadow: tokens.boxShadow,
    },
  },
  plugins: [
    // text-display-bold 등 typography 유틸
    plugin(({ addUtilities }) =>
      addUtilities(
        Object.fromEntries(
          Object.entries(tokens.typography).map(([name, style]) => [`.text-${name}`, style]),
        ),
      ),
    ),
  ],
};
