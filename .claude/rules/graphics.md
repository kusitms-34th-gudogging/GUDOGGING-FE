---
paths:
  - 'src/assets/graphics/**'
---

# 그래픽 에셋 규칙

아이콘(`icons.md`)과 달리 **색이 고정된 SVG**. 쓰는 곳에서는 크기만 조절하고 색은 바꾸지 않음

## 폴더

- `category/`: 구독 카테고리 전용 (OTT·음악·쇼핑 등 카테고리 표시에만 쓰는 것)
- `shared/`: 그 외 여러 화면에서 쓰는 그래픽 (빈 상태·알림·지갑 등)
- 애매하면 `shared/`. 카테고리 의미가 아니면 카테고리 화면에서만 써도 `shared/`

## 파일명

- `asset_{이름}_{color|mono}.svg` (소문자 snake_case)
  - 예: `asset_wallet_color.svg`, `asset_ott_mono.svg`
- 컬러·모노 버전을 둘 다 넣음 (Figma에 한쪽만 있으면 있는 것만)

## SVG

- Figma에서 export한 그대로 넣음. 색을 `#000`으로 바꾸거나 `vector-effect`를 넣지 않음
  - 이 폴더엔 `svgr.config.js`가 없어서 색이 그대로 유지됨 (추가하지 않음)
  - 그래픽은 크기에 비례해 선도 같이 커지고 작아져야 함
- 루트 `<svg>`에 `viewBox`가 있어야 크기 조절 시 비율 유지 (Figma export는 기본 포함)

## export (배럴)

- `src/assets/graphics/index.ts`에서 컴포넌트 이름으로 export. 파일명을 PascalCase로 바꾸고 `Asset`을 붙임

  ```ts
  export { default as WalletColorAsset } from './shared/asset_wallet_color.svg';
  export { default as WalletMonoAsset } from './shared/asset_wallet_mono.svg';
  export { default as OttColorAsset } from './category/asset_ott_color.svg';
  ```

- 폴더별로 묶어서 정렬 (category → shared, 각 안에서 이름순)

## 사용

```tsx
import { WalletColorAsset } from '@/assets/graphics';

<WalletColorAsset className="size-s48" />;
```

- `className`엔 크기만 (`size-*`, `w-*`/`h-*`). `text-*` 색 클래스는 효과 없음
- 크기는 size·spacing 토큰 우선, 없으면 arbitrary(`size-[80px]`). 반복되면 토큰 등록 요청
- SVG 추가·이동 후 `pnpm start -c`로 캐시 초기화
