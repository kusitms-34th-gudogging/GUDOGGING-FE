# 디자인 토큰 흐름

> 현재 `tokens/` 폴더와 Style Dictionary 설정은 아직 없음. 도입 시 아래 구조를 따름.

```txt
Figma (Tokens Studio)
   │ GitHub Sync
   ▼
tokens/default-token.json        ← Figma 원본, 손으로 안 고침
   │ Style Dictionary (format: json/nested, v4: formats.jsonNested)
   ▼
tokens/tailwind-tokens.json      ← 자동 생성, 손으로 안 고침 (src/app 밖)
   │ require
   ▼
tailwind.config.js (theme.extend)
```

```js
// tailwind.config.js
const tokens = require('./tokens/tailwind-tokens.json');

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      spacing: tokens.spacing,
      borderRadius: tokens.borderRadius,
      fontSize: tokens.fontSize,
      colors: tokens.colors,
    },
  },
  plugins: [],
};
```

- Tailwind v3는 `tailwind.config.js`가 있으므로 토큰은 CSS `@theme`이 아니라 `theme.extend`로
- 토큰 이름 구조를 `spacing`·`borderRadius` 등 키에 맞추는 건 Style Dictionary 설정(`sd-tokens-config`)에서 처리
- radius 라벨 S/L → `sm`/`lg`. `rounded-l`처럼 방향 유틸과 겹치는 키 금지
- tailwind-merge 도입 시 토큰 카테고리 추가마다 `extendTailwindMerge` 갱신
