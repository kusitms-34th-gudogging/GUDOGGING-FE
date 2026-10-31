---
paths:
  - 'src/components/**'
  - 'src/screens/**'
  - 'src/hooks/**'
  - 'src/utils/**'
---

# 컴포넌트 · import · 타입 규칙

## 위치

- `screens/`: 화면 본체(`XxxScreen.tsx`)만
- `components/common/`: 디자인 시스템 컴포넌트(Figma "공통 컴포넌트" 섹션) + 2개 이상 도메인에서 쓰는 컴포넌트
- `components/{도메인}/`: 한 도메인 안에서만 쓰는 컴포넌트 (화면이 하나든 여러 개든). 도메인 폴더는 화면 만들 때 추가
- `hooks/`: `useXxx.ts` · `utils/`: 순수 함수 (테스트 파일은 옆에) · `constants/`: 상수
- 도메인끼리 import 금지. 다른 도메인에서도 쓰게 되면 그때 `common/`으로 옮김
- barrel `index.ts` 만들지 않음 → `@/components/common/Button`처럼 파일 경로로 직접 import

## 파일명

- 컴포넌트·화면 파일은 PascalCase: `ProfileCard.tsx`, `HomeScreen.tsx`
- 훅·유틸 파일은 export 이름 그대로 camelCase: `useProfile.ts`, `cn.ts`
- 도메인 폴더는 camelCase: `components/subscription/`
- 예외: 라우트 파일(`src/app/`), 아이콘 SVG(`icons.md`의 snake_case)

## 컴포넌트가 커지면 폴더로

- 파일은 PascalCase(`ProfileCard.tsx`), 폴더는 camelCase(`profileCard/`) + 본체는 `index.tsx`
- 폴더로 바꾸면 import 경로 대소문자가 바뀜 → 쓰던 곳 import 같이 수정
- 내부 조각(`Avatar.tsx` 등)이 다른 곳에서도 쓰이면 그때 도메인 폴더나 `common/`으로 꺼냄

## Figma property → props

| Figma                                  | props                                          | 비고                                    |
| -------------------------------------- | ---------------------------------------------- | --------------------------------------- |
| `Type=Primary/Dark/Tonal`              | `variant` (cva)                                | 값은 소문자 유니온                      |
| `Size=L/M/S`                           | `size` (cva)                                   | `'lg' \| 'md' \| 'sm'`                  |
| `State=Pressed`                        | props 없음                                     | `Pressable` + `active:` 클래스          |
| `State=Focused`                        | props 없음                                     | 내부 상태 (`onFocus`/`onBlur`)          |
| `State=Disabled`                       | `disabled?: boolean`                           |                                         |
| `State=Error`                          | `error?: boolean` 또는 `errorMessage?: string` |                                         |
| `On/Off`·`Checked`·`Selected`·`Active` | 제어 컴포넌트                                  | 아래 이름 통일                          |
| boolean property                       | **전부 boolean prop으로**                      | 하나도 빠뜨리지 않음                    |
| instance swap (아이콘)                 | `icon?: ComponentType<SvgProps>`               | `@/assets/icons` 컴포넌트를 그대로 받음 |
| 그 외 (`Provider`, `Menu`, `Buttons`)  | 의미에 맞는 이름의 유니온                      | 예: `provider: 'apple' \| 'google'`     |

- 상태 props 이름: 켜짐 `value`/`onValueChange`, 체크 `checked`/`onCheckedChange`, 선택 `selected`/`onSelect`
- 라벨·문구는 하드코딩하지 않고 props로
- Figma에 component set이 있으면 variant·boolean property 전부 구현

## 데이터

- 컴포넌트에서 API 호출 금지. 데이터는 화면·훅에서 받아 props로 넘김
- 도메인 타입을 props로 받는 건 허용 (`subscription: Subscription`)

## 접근성

- 누를 수 있는 요소는 `accessibilityRole` 필수 (`button`, `switch`, `checkbox`, `tab`, `radio` 등)
- `accessibilityState`에 `checked`·`selected` 연결 (`disabled`는 `Pressable`이 자동 반영)
- 아이콘만 있는 버튼은 `accessibilityLabel`을 필수 prop으로

## Toast · Modal

- Toast: 전역 호출형. `src/app/_layout.tsx`에 Host 하나 두고 `useToast().show({ type, message })`로 호출 (Context + Reanimated, 라이브러리 추가 안 함)
- Modal: props형. `visible`/`onClose`로 제어. 전역 `confirm()`은 같은 확인 모달이 여러 화면에서 반복될 때 추가
- RN `<Modal>`·`presentation: 'modal'` 화면은 iOS에서 루트 Host보다 위에 그려져 Toast가 가려짐. 모달 위 토스트가 필요하면 별도 처리

## import

- 같은 폴더 안: 상대경로 (`./Avatar`)
- 폴더 밖: `@/` 절대경로. `../../` 로 거슬러 올라가기 금지
- import 정렬은 `simple-import-sort`가 처리 (`pnpm lint --fix`)

## 타입

- `any` 금지 → `unknown` + 타입 가드
- props 타입은 `interface {ComponentName}Props`
- 타입은 쓰는 곳 가까이. 여러 곳에서 공유될 때만 `src/types/`로 올림. 중복 정의 대신 가져와서 확장
- export는 named export (`export const X = ...`)
