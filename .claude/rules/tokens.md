---
paths:
  - 'tailwind.config.js'
  - 'tokens/**'
---

# 디자인 토큰 규칙

- `tokens/default-token.json`(Figma 원본), `tokens/tailwind-tokens.json`(Style Dictionary 생성)은 **손으로 수정 금지**
- 토큰은 `tailwind.config.js`의 `theme.extend`에 생성 JSON을 `require`해서 연결 (CSS `@theme` 아님)
- 생성 파일을 `src/app/` 안에 두지 않음
- radius 라벨 S/L은 `sm`/`lg`로. `rounded-l`처럼 방향 유틸과 겹치는 키 금지
- tailwind-merge를 추가했다면 토큰 카테고리 추가 시 `extendTailwindMerge`도 갱신
- 전체 흐름: `.claude/docs/design-tokens.md`
