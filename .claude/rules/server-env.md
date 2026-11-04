---
paths:
  - 'src/server/**'
  - 'src/app/api/**'
  - '.env*'
---

# 환경변수 · 서버 코드 규칙

- 앱 코드엔 `EXPO_PUBLIC_*` 환경변수만 (앱 번들에 포함되어 사용자 기기로 감)
- **비밀 키는 절대 `EXPO_PUBLIC_`에 넣지 않음**
- 일반 `process.env`는 `+api` 서버 코드에서만 사용
- 서버 전용 코드(auth, db 등)는 `src/server/` (앱 코드에서 import하면 `eslint.config.js`가 막음)
- `.env`는 커밋하지 않음 (`.gitignore` 포함)

## 이럴 때 더 읽기

- `src/app/api`·`src/server`(BFF)를 쓸지 정할 때 → `.claude/rules/data-fetching.md`
- 파일 위치가 애매할 때 → `.claude/docs/architecture.md`
