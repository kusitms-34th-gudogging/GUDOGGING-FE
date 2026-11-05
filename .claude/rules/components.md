---
paths:
  - 'src/components/**'
  - 'src/screens/**'
  - 'src/hooks/**'
  - 'src/utils/**'
  - 'src/lib/**'
---

# 컴포넌트 규칙

## 파일명

- 컴포넌트·화면 파일은 PascalCase: `ProfileCard.tsx`, `HomeScreen.tsx`
- 훅·유틸 파일은 export 이름 그대로 camelCase: `useProfile.ts`, `cn.ts`
- 도메인 폴더는 camelCase: `components/subscription/`
- 예외: 라우트 파일(`src/app/`), SVG 파일(snake_case)

## import

- barrel `index.ts` 만들지 않음 → `@/components/common/Button`처럼 파일 경로로 직접 import (예외: `assets/icons`·`assets/graphics`)
- 도메인끼리 import 금지. 다른 도메인에서도 쓰게 되면 그때 `common/`으로 옮김

## 타입

- props 타입 이름은 `{ComponentName}Props` (`ButtonProps`, `ProfileScreenProps`)
- `any` 대신 `unknown` + 타입 가드

## 데이터

- 컴포넌트에서 API 호출 금지. 화면이 API 훅(`src/hooks/`)을 호출하고 로딩·에러 UI를 그린 뒤 결과를 props로 넘김
- 도메인 타입을 props로 받는 건 허용 (`subscription: Subscription`)
- 타입은 중복 정의하지 않고 가져와서 확장

## 접근성

- 누를 수 있는 요소는 `accessibilityRole` 필수 (`button`, `switch`, `checkbox`, `tab`, `radio` 등)
- `accessibilityState`에 `checked`·`selected` 연결 (`disabled`는 `Pressable`이 자동 반영)
- 아이콘만 있는 버튼은 `accessibilityLabel`을 필수 prop으로

## 이럴 때 더 읽기

- Figma 컴포넌트를 props로 옮길 때 (property·variant·boolean) → `.claude/docs/components/figma-props.md`
- variant 스타일(cva)을 만들 때 → `.claude/docs/styling/cva.md`
- Toast·Modal을 쓰거나 만들 때 → `.claude/docs/components/toast-modal.md`
- API 훅을 만들 때 → `.claude/rules/data-fetching.md`
- 컴포넌트가 커져서 폴더로 바꿀 때 → `.claude/docs/architecture.md` "컴포넌트 파일 → 폴더 전환"
- 파일 위치가 애매할 때 → `.claude/docs/architecture.md`
- 테스트를 짤 때 → `.claude/skills/add-test/SKILL.md`
