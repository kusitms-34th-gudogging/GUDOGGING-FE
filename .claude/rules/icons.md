---
paths:
  - 'src/assets/icons/**'
---

# 아이콘 규칙

- 이 폴더는 **단색 SVG 전용**. 여러 색 SVG는 다른 폴더에 (전부 currentColor로 바뀌어버림)
- 파일명: `icon_{모양}_{방향(화살표만)}_{fill|regular|thin}.svg` (소문자 snake_case)
  - 예: `icon_home_regular.svg`, `icon_arrow_left_fill.svg`
- `index.ts`에서 컴포넌트 이름으로 export: `export { default as HomeIcon } from './icon_home_regular.svg';`
- SVG 안 색이 `#000`/`#000000`과 정확히 일치해야 currentColor로 변환됨 (`svgr.config.js`)
- 사용: `<HomeIcon className="size-6 text-red-500" />` (크기·색 모두 className)
- SVG 추가·이동·설정 변경 후 `pnpm start -c`로 캐시 초기화
