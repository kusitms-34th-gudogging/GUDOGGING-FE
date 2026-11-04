# GUDOGGING-FE

구독 관리 앱. Expo SDK 58 · Expo Router · NativeWind v4 · pnpm · iOS 우선

모든 AI 도구 공통 지침의 진입점. 규칙 본문은 아래 문서에 한 번씩만 있음

## 작업 순서

1. 경로별 규칙(`.claude/rules/*.md`)은 frontmatter `paths`에 맞는 파일을 다룰 때 읽음 (Claude Code·CodeRabbit은 자동)
2. 아래 "작업별 시작 문서"를 읽고, 각 문서 맨 아래 `이럴 때 더 읽기`에서 **조건에 맞는 것만** 따라 읽음
3. 끝내기 전 `pnpm check` (lint·typecheck·test·format. CI와 같음)

## Expo는 기억 말고 문서

`package.json`의 `expo` 메이저 버전 → `https://docs.expo.dev/versions/v<메이저>.0.0/`. 그 외는 `https://docs.expo.dev/llms.txt`

## 명령어

- 패키지 추가 `pnpm expo install <pkg>` (`pnpm add` 금지) · 버전 맞춤 `pnpm expo install --fix`
- `pnpm start -c` (SVG 추가 후 캐시 초기화) · 토큰 재생성 `pnpm tokens:build`
- 네이티브 모듈·Pretendard는 Expo Go에서 안 보임 → 개발 빌드 `npx expo run:ios`

## 절대 규칙 (lint로 못 잡는 것만)

- `ios/`·`android/` 직접 수정 금지. 네이티브 설정은 `app.json`·config plugin (CNG). Expo 모듈 우선
- 토큰 JSON 수정·`design-token` 브랜치 작업 금지 → `.claude/docs/design-tokens.md`
- 비밀 키를 `EXPO_PUBLIC_*`에 넣지 않음 → `.claude/rules/server-env.md`
- `src/app/`에는 라우트 파일만 → `.claude/rules/routing.md`
- 코드 스타일은 `eslint.config.js`·`.prettierrc`가 원본 (에러 메시지에 대안 있음). 문서에 다시 적지 않음

## 작업별 시작 문서

`.claude/skills/*/SKILL.md`는 절차 (Claude Code는 `/이름`)

- 파일 위치: `.claude/docs/architecture.md`
- 새 화면: `.claude/skills/new-screen/SKILL.md`
- Figma 구현: `.claude/skills/figma-publish/SKILL.md`
- 아이콘·에셋: `.claude/skills/add-icon/SKILL.md` · `.claude/skills/add-asset/SKILL.md`
- 토큰·폰트: `.claude/docs/design-tokens.md`
- API 연동: `.claude/rules/data-fetching.md`
- 테스트: `.claude/skills/add-test/SKILL.md`
- 커밋·PR: `.claude/skills/commit/SKILL.md` · `.claude/skills/pr/SKILL.md`
- CodeRabbit 리뷰 대응: `.claude/skills/coderabbit-review/SKILL.md`
- 지침 문서 수정: `.claude/docs/writing-docs.md`
