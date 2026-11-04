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
- 선(stroke) 아이콘은 `<path>`에 `vector-effect="non-scaling-stroke"`. 없으면 24px 기준 선 굵기가 크기 따라 같이 줄어듦 (16px에서 1.75 → 약 1.17)
- 사용: `<HomeIcon className="size-icon-md text-icon-primary" />` (크기·색 모두 className)
- SVG 추가·이동·설정 변경 후 `pnpm start -c`로 캐시 초기화

## 이럴 때 더 읽기

- 아이콘을 새로 추가할 때 → `.claude/skills/add-icon/SKILL.md`
- 여러 색이거나 색이 고정된 SVG면 → `.claude/rules/graphics.md`
