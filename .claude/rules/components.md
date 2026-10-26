---
paths:
  - 'src/components/**'
  - 'src/screens/**'
  - 'src/hooks/**'
  - 'src/utils/**'
---

# 컴포넌트 · import · 타입 규칙

## 위치

- `screens/`: 화면 본체 + 그 화면에서만 쓰는 하위 컴포넌트
- `components/`: 여러 화면에서 재사용하는 컴포넌트
- `hooks/`: `useXxx.ts` · `utils/`: 순수 함수 (테스트 파일은 옆에) · `constants/`: 상수

## 파일명

- 컴포넌트·화면 파일은 PascalCase: `ProfileCard.tsx`, `HomeScreen.tsx`
- 훅·유틸 파일은 export 이름 그대로 camelCase: `useProfile.ts`, `cn.ts`
- 예외: 라우트 파일(`src/app/`), 아이콘 SVG(`icons.md`의 snake_case)

## 컴포넌트가 커지면 폴더로

- 파일은 PascalCase(`ProfileCard.tsx`), 폴더는 camelCase(`profileCard/`) + 본체는 `index.tsx`
- 폴더로 바꾸면 import 경로 대소문자가 바뀜 → 쓰던 곳 import 같이 수정
- 내부 조각(`Avatar.tsx` 등)이 다른 곳에서도 쓰이면 그때 `components/` 바로 아래로 꺼냄

## import

- 같은 폴더 안: 상대경로 (`./Avatar`)
- 폴더 밖: `@/` 절대경로. `../../` 로 거슬러 올라가기 금지
- import 정렬은 `simple-import-sort`가 처리 (`pnpm lint --fix`)

## 타입

- `any` 금지 → `unknown` + 타입 가드
- props 타입은 `interface {ComponentName}Props`
- 타입은 쓰는 곳 가까이. 여러 곳에서 공유될 때만 `src/types/`로 올림. 중복 정의 대신 가져와서 확장
- export는 named export (`export const X = ...`)
