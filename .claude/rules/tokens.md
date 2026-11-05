---
paths:
  - 'tailwind.config.js'
  - 'tokens/**'
---

# 디자인 토큰 규칙

항상 읽기: `.claude/docs/design-tokens.md` (흐름·빌드·빌드 설정 규칙). 매핑을 바꾸면 `.claude/docs/styling/token-classes.md` 표도 같이 고침

- `tokens/*.json`은 손으로 수정 금지 (`AGENTS.md` 절대 규칙, `.claude/settings.json`이 편집도 막음)
- 이 경로를 고치면 `pnpm tokens:build` 후 생성 결과도 같이 커밋
