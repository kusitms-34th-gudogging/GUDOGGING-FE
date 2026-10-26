---
paths:
  - 'tailwind.config.js'
  - 'tokens/**'
---

# 디자인 토큰 규칙

- `tokens/default-token.json`(Figma 원본), `tokens/tailwind-token.json`(생성 파일)은 **손으로 수정 금지**
- 빌드 설정(`tokens/sd-tokens-config.mjs`)을 바꿨으면 `pnpm tokens:build` 후 `tailwind-token.json`도 같이 커밋 (안 하면 CI 실패)
- 토큰은 `tailwind.config.js`의 `theme.extend`에 생성 JSON을 `require`해서 연결 (CSS `@theme` 아님)
- className으로 표현 못 하는 카테고리만 `tokens/index.ts`(`@tokens`)로 노출
- radius 라벨 S/L은 `sm`/`lg`로. `rounded-l`처럼 방향 유틸과 겹치는 키 금지 (빌드가 실패시킴)
- tailwind-merge를 추가했다면 토큰 카테고리 추가 시 `extendTailwindMerge`도 갱신
- 전체 흐름·매핑표: `.claude/docs/design-tokens.md`
