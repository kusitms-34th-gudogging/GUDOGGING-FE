---
name: add-asset
description: 색이 고정된 그래픽 SVG(컬러·모노)를 추가할 때 사용. "에셋 추가해줘", "그래픽 추가해줘" 요청 시 src/assets/graphics에 컨벤션대로 파일 배치·export. 단색 아이콘은 /add-icon
---

# 그래픽 에셋 추가

규칙(폴더·파일명·SVG·export·사용법)은 `.claude/rules/graphics.md`. 아래는 순서만

1. `.claude/rules/graphics.md`를 읽음
2. 단색이고 쓰는 곳마다 색을 바꿔야 하면 아이콘이므로 `.claude/skills/add-icon/SKILL.md`로 안내하고 멈춤
3. 규칙대로 폴더(`category/`·`shared/`) 결정
4. SVG는 Figma export 그대로 두고 루트 `<svg>`에 `viewBox`가 있는지만 확인
5. 규칙의 파일명으로 저장 (컬러·모노가 둘 다 있으면 둘 다)
6. `src/assets/graphics/index.ts`에 규칙대로 export 추가
7. 카테고리 에셋이면 `src/components/common/AssetTile.tsx`의 tone(`{카테고리}`·`{카테고리}-bgx`)과 `categoryAssets`에 추가. 타일 배경 토큰 `bg-category-{카테고리}-tile`이 없으면 사용자에게 알림
8. 사용자에게 `pnpm start -c`로 캐시 초기화가 필요하다고 안내
