---
name: add-icon
description: SVG 아이콘을 추가할 때 사용. "아이콘 추가해줘" 요청 시 src/assets/icons에 컨벤션대로 파일 배치·export
---

# 아이콘 추가

1. 단색 SVG인지 확인. 여러 색이면 이 폴더에 넣지 말고 사용자에게 알림
2. SVG 안 색을 `#000` 또는 `#000000`으로 통일 (그래야 currentColor로 변환됨)
3. 파일명 `icon_{모양}_{방향(화살표만)}_{fill|regular|thin}.svg` 로 `src/assets/icons/`에 저장
4. `src/assets/icons/index.ts`에 export 추가 (기존 `export {};` 플레이스홀더는 첫 아이콘 추가 시 제거)

   ```ts
   export { default as ArrowLeftIcon } from './icon_arrow_left_fill.svg';
   ```

5. 사용: `import { ArrowLeftIcon } from '@/assets/icons';` → `<ArrowLeftIcon className="size-icon-md text-icon-primary" />`
6. 사용자에게 `pnpm start -c`로 캐시 초기화 필요하다고 안내
