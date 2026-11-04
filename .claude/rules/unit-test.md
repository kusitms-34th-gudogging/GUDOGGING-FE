---
paths:
  - '**/__tests__/**'
---

# 단위 테스트 규칙 (Jest · RNTL)

기준: **`package.json`에 설치된 버전의 공식 문서** ([Expo Unit testing](https://docs.expo.dev/develop/unit-testing/) · [Router testing](https://docs.expo.dev/router/reference/testing/) · [RNTL](https://oss.callstack.com/react-native-testing-library/)). API는 기억 말고 문서 확인

> 아래 내용은 Expo SDK 58 · Jest 30 · RNTL 14에서 확인함. 버전을 올리면 해당 버전 문서와 대조해 이 파일도 갱신

## 범위

| 종류      | 도구                                 | 검증할 것             | 예                            |
| --------- | ------------------------------------ | --------------------- | ----------------------------- |
| Unit      | Jest (`jest-expo`)                   | input → output        | `utils/` 순수 함수, 훅 로직   |
| 컴포넌트  | RNTL                                 | 상호작용 결과         | disabled면 안 눌림, 에러 문구 |
| 화면 전환 | RNTL + `expo-router/testing-library` | 버튼 → 다음 화면 이동 | 누르면 `/profile`로 경로 변경 |

- 화면 전환은 E2E가 아니라 여기서(`renderRouter`) 검증
- 실기기에서만 확인되는 것(네이티브 모듈·권한·폰트·키보드)은 E2E로 (`e2e-test.md`)
- 스냅샷 테스트 안 함 (Expo 문서도 UI 검증은 스냅샷 대신 E2E 권장)

## 좋은 테스트 기준 (양보다 질)

테스트 하나를 추가할 때 **아래 4개를 전부 만족**해야 함. 하나라도 아니면 고치거나 지움

| 기준             | 확인 방법                                                       |
| ---------------- | --------------------------------------------------------------- |
| 실패할 수 있음   | 대상 코드를 일부러 망가뜨리면 실패한다                          |
| 결과를 검증      | 입력 → 출력, 또는 사용자가 보는 결과(문구·이동·호출)를 검증한다 |
| 구조 변경에 강함 | 동작은 그대로 두고 내부 구현만 바꾸면 여전히 통과한다           |
| 항상 같은 결과   | 실행 순서·현재 시간·네트워크와 상관없이 같은 결과가 나온다      |

**쓸 곳**: 분기·계산·변환 로직, 사용자 행동의 결과(누르면 이동·disabled면 안 눌림), 버그가 났던 곳(재발 방지)

**안 쓸 곳**: 우리가 쓴 판단(분기·계산·조건)이 없는 코드

| 안 씀 ❌                                            | 대신 이건 씀 ✅                                       |
| --------------------------------------------------- | ----------------------------------------------------- |
| `label="저장"` 넣으면 "저장"이 보인다 (그대로 표시) | `errorMessage`가 있을 때만 에러 문구가 보인다 (분기)  |
| 버튼 누르면 `onPress`가 불린다 (Pressable 동작)     | `disabled`면 눌러도 `onPress`가 안 불린다 (우리 로직) |
| 필수 prop 빠지면 에러 (타입이 이미 막음)            | —                                                     |
| 커버리지 숫자 채우려고 줄만 실행                    | —                                                     |

## 파일 위치

```txt
src/
├─ app/                         # ❌ 테스트 파일 금지 (전부 라우트로 인식됨)
├─ screens/__tests__/
│  └─ HomeScreen.test.tsx       # 화면 렌더 · 화면 전환 (renderRouter)
├─ components/common/__tests__/
│  └─ Button.test.tsx           # 컴포넌트 상호작용
├─ hooks/__tests__/
│  └─ useDogs.test.tsx          # 훅 (QueryClient 감싸서)
├─ lib/__tests__/
│  └─ request.test.ts           # fetch 래퍼
└─ utils/__tests__/
   └─ cn.test.ts                # 순수 함수
```

- 테스트는 **대상 폴더의 `__tests__/`** 안에, 이름은 **`{대상 파일명}.test.ts(x)`**
  - jest-expo testMatch(확인함): `__tests__/` 안 파일 전부 + 어디서든 `*.test.*`·`*.spec.*`. Expo 문서의 `-test.tsx`는 `__tests__/` 안이라서 잡히는 것 (밖에 두면 안 잡힘)
- 폴더 이름은 정확히 **`__tests__`** (`__test__`는 인식 안 됨). 대상 폴더 바로 아래 하나만, 그 안에 하위 폴더 만들지 않음
- 컴포넌트가 폴더로 바뀌면(`profileCard/index.tsx`) 테스트도 `profileCard/__tests__/ProfileCard.test.tsx`
- `__tests__/` 안 파일은 **전부 테스트로 실행됨** → 헬퍼·mock 데이터 두지 않음. 헬퍼는 2곳 이상에서 쓸 때 `src/lib/testing.tsx`로 (그 전엔 테스트 파일 안에)

## 설정 (최초 1회)

```sh
pnpm expo install jest-expo jest @types/jest @testing-library/react-native test-renderer --dev
```

- `test-renderer`는 RNTL 14의 peer dependency (`react-test-renderer`는 React 19 미지원으로 deprecated)
- `tsconfig.json`의 `compilerOptions.types`에 `"jest"` (없으면 typecheck에서 `it`·`expect` 에러)
- Jest 설정은 `package.json`의 `"jest"` 키 (별도 `jest.config.js` 만들지 않음). Expo 문서의 pnpm 패턴에 **`standard-navigation` 추가 필수** (expo-router 58의 ESM 의존성, 없으면 `expo-router` import하는 테스트가 `Must use import to load ES Module`로 실패)

```json
"jest": {
  "preset": "jest-expo",
  "transformIgnorePatterns": [
    "node_modules/(?!(.pnpm|(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|standard-navigation))"
  ]
}
```

## 가짜 테스트 금지

- `expect` 없는 테스트, `.only`·`.skip` 커밋 금지
- **동어반복 금지**: 기대값을 구현과 같은 로직으로 계산하지 않음. 기대값은 손으로 쓴 리터럴

```ts
// ❌ 구현을 그대로 다시 씀 → 구현이 틀려도 통과
expect(formatAge(birth)).toBe(`${today.getFullYear() - birth.getFullYear()}살`);
// ✅ 손으로 계산한 값
expect(formatAge(new Date('2020-03-01'), new Date('2026-11-04'))).toBe('6살');
```

- 테스트 대상 자체를 mock하지 않음. mock은 경계에서만: `fetch`, 네이티브 모듈, 시간(`jest.useFakeTimers`)
- 우리 컴포넌트·훅은 mock하지 않고 진짜로 렌더
- `className`·스타일 값 검증 안 함 (구현 디테일)

## 컴포넌트 테스트 (RNTL)

- **`render`·`renderHook`·`fireEvent`·`act`는 async** (RNTL 14~) → 항상 `await render(...)`
- 쿼리 우선순위(RNTL 공식): `*ByRole` > `*ByLabelText`·`*ByPlaceholderText`·`*ByDisplayValue` > `*ByText`·`*ByHintText` > `*ByTestId`(최후)
- 우리 컴포넌트는 `accessibilityRole` 필수라 `getByRole('button', { name: '저장' })`로 찾음
- 입력은 `userEvent` (`press`·`type`·`longPress`·`clear`). `fireEvent`는 userEvent가 지원 안 하는 상호작용만
- 하나 찾기 `getBy*`, 비동기 등장 `findBy*`, 없음 확인은 `queryBy*` + `not.toBeOnTheScreen()`
- matcher(`toBeOnTheScreen`·`toBeDisabled`·`toHaveTextContent` 등)는 RNTL import만 하면 내장. `jest-native` 설치 안 함

```tsx
// src/components/common/__tests__/Button.test.tsx
import { render, screen, userEvent } from '@testing-library/react-native';

import { Button } from '@/components/common/Button';

it('disabled면 onPress가 호출되지 않는다', async () => {
  const onPress = jest.fn();
  await render(<Button label="저장" disabled onPress={onPress} />);

  await userEvent.setup().press(screen.getByRole('button', { name: '저장' }));

  expect(onPress).not.toHaveBeenCalled();
});
```

## 화면 전환 (Expo Router)

- `expo-router/testing-library`의 `renderRouter` (RNTL 14 이상 필요). 결과는 `await`
- mock 라우트 키는 `./`·`/`·확장자 없이: `'index'`, `'profile/[id]'`, `'(tabs)/home'`
- 이동 검증은 `expect(screen).toHavePathname(...)` · `toHaveSegments` · `toHaveSearchParams`
- `userEvent`는 `expo-router/testing-library`에 없음 → `@testing-library/react-native`에서 import
- 화면 안 `useFocusEffect`(expo-router)도 `renderRouter`에서 실제로 호출됨

```tsx
// src/screens/__tests__/HomeScreen.test.tsx
import { userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderRouter, screen } from 'expo-router/testing-library';
import { Pressable, Text } from 'react-native';

// 예시용 화면. 실제로는 @/screens의 화면을 넣음
// typed routes라 push 경로는 src/app에 실제 라우트가 있어야 typecheck 통과 (여기선 src/app/profile.tsx 필요)
const Home = () => (
  <Pressable accessibilityRole="button" onPress={() => router.push('/profile')}>
    <Text>프로필</Text>
  </Pressable>
);

it('프로필 버튼을 누르면 프로필로 이동한다', async () => {
  await renderRouter({ index: Home, profile: () => null }, { initialUrl: '/' });

  await userEvent.setup().press(screen.getByRole('button', { name: '프로필' }));

  expect(screen).toHavePathname('/profile');
});
```

## API 쓰는 훅 · 화면

- 테스트마다 새 `QueryClient` (`retry: false`). 테스트끼리 캐시 공유 금지
- 네트워크는 `jest.spyOn(globalThis, 'fetch')`로 응답 고정. 실제 서버 호출 금지
- 성공 · 에러(4xx/5xx) · 로딩 각각 검증

## 속도

- 개발 중엔 변경분만 (`jest --watch --changedSince=origin/dev`), CI에서 전체
- 실제 타이머로 기다리지 않음 → `jest.useFakeTimers()` (userEvent는 `userEvent.setup({ advanceTimers: jest.advanceTimersByTime })`)
- 느린 테스트는 범위를 줄이거나 단계를 내림 (화면 전환 → 컴포넌트 → unit)
