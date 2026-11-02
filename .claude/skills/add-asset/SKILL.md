---
name: add-asset
description: 색이 고정된 그래픽 SVG(컬러·모노)를 추가할 때 사용. "에셋 추가해줘", "그래픽 추가해줘" 요청 시 src/assets/graphics에 컨벤션대로 파일 배치·export. 단색 아이콘은 /add-icon
---

# 그래픽 에셋 추가

규칙 전체는 `.claude/rules/graphics.md`

1. 단색이고 쓰는 곳마다 색을 바꿔야 하면 아이콘이므로 `/add-icon`으로 안내하고 멈춤
2. 폴더 결정: 구독 카테고리 표시 전용이면 `category/`, 그 외 `shared/`
3. SVG는 Figma export 그대로 둠. 색을 `#000`으로 바꾸거나 `vector-effect`를 넣지 않음. 루트 `<svg>`에 `viewBox`가 있는지 확인
4. 파일명 `asset_{이름}_{color|mono}.svg`(소문자 snake_case)로 저장. 컬러·모노가 둘 다 있으면 둘 다 넣음
5. `src/assets/graphics/index.ts`에 export 추가. 파일명을 PascalCase로 바꾸고 `Asset`을 붙임. 폴더별(category → shared), 이름순으로 정렬

   ```ts
   export { default as WalletColorAsset } from './shared/asset_wallet_color.svg';
   export { default as WalletMonoAsset } from './shared/asset_wallet_mono.svg';
   ```

6. 카테고리 에셋이면 `src/components/common/AssetTile.tsx`의 `assetTileVariants` tone(`{카테고리}`·`{카테고리}-bgx`)과 `categoryAssets`에 추가. 타일 배경 토큰 `bg-category-{카테고리}-tile`이 없으면 사용자에게 알림
7. 사용: 타일이면 `<AssetTile tone="brand" asset={WalletColorAsset} />`, 에셋만이면 `<WalletColorAsset className="size-s48" />` (className엔 크기만)
8. 사용자에게 `pnpm start -c`로 캐시 초기화가 필요하다고 안내
