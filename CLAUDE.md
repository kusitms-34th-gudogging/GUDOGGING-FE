# GUDOGGING-FE

Expo SDK 57 · Expo Router · NativeWind v4(Tailwind v3) · pnpm. Expo API는 기억 말고 `AGENTS.md`의 버전별 문서 확인.

## 명령어

- `pnpm start` (캐시 초기화: `pnpm start -c`) · `pnpm lint` · `pnpm typecheck` · `pnpm format`
- 패키지 추가는 `pnpm expo install <pkg>` (SDK 호환 버전)
- 작업 끝내기 전 `pnpm lint && pnpm typecheck` 통과 필수 (CI와 동일)

## 절대 규칙

- `src/app/`에는 라우트 파일만. 화면 본체는 `src/screens/`, 라우트는 얇은 껍데기
- 폴더 밖 import는 `@/`, 같은 폴더 안만 상대경로
- 스타일은 `className`만. 인라인 `style={{}}`·`StyleSheet.create` 금지 (Reanimated 예외), 조건부 클래스는 `cn`
- `any` 금지 → `unknown` + 타입 가드. props는 `interface {Name}Props`
- 비밀 키를 `EXPO_PUBLIC_*`에 넣지 않음. 서버 전용 코드는 `src/server/`
- `ios/`, `android/` 직접 수정 금지 (CNG). 토큰 생성 파일 직접 수정 금지
- 커밋: `#이슈번호 [타입] 작업내용` (husky가 검사)

## 언제 뭘 읽을지

| 상황                      | 읽을 파일                                          |
| ------------------------- | -------------------------------------------------- |
| 새 파일 위치 판단         | `.claude/docs/architecture.md`                     |
| 토큰·tailwind.config 작업 | `.claude/docs/design-tokens.md`                    |
| 화면 추가 / 아이콘 추가   | `/new-screen` / `/add-icon` 스킬                   |
| Figma 디자인 구현         | `/figma-publish` 스킬 (`figma-publisher` 에이전트) |
| 커밋 / PR                 | `/commit` / `/pr` 스킬                             |
