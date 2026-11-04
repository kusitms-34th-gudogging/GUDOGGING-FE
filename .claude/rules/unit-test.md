---
paths:
  - '**/__tests__/**'
---

# 단위 테스트 규칙 (Jest · RNTL)

기준: **`package.json`에 설치된 버전의 공식 문서** ([Expo Unit testing](https://docs.expo.dev/develop/unit-testing/) · [Router testing](https://docs.expo.dev/router/reference/testing/) · [RNTL](https://oss.callstack.com/react-native-testing-library/)). API는 기억 말고 문서 확인

## 범위

| 종류      | 도구                                 | 검증할 것             | 예                            |
| --------- | ------------------------------------ | --------------------- | ----------------------------- |
| Unit      | Jest (`jest-expo`)                   | input → output        | `utils/` 순수 함수, 훅 로직   |
| 컴포넌트  | RNTL                                 | 상호작용 결과         | disabled면 안 눌림, 에러 문구 |
| 화면 전환 | RNTL + `expo-router/testing-library` | 버튼 → 다음 화면 이동 | 누르면 `/profile`로 경로 변경 |

- 화면 전환은 E2E가 아니라 여기서(`renderRouter`) 검증
- 실기기에서만 확인되는 것(네이티브 모듈·권한·폰트·키보드)은 E2E로 (`.claude/rules/e2e-test.md`)

## 1. 테스트 대상 고르기 (팀 규칙)

테스트를 짜기 전에 **이 코드를 테스트할지** 먼저 정함. 기준: 우리가 쓴 판단(분기·계산·조건)이 있는가

**테스트할 것**

- 분기·계산·변환 로직
- 사용자 행동의 결과 (누르면 이동, disabled면 안 눌림)
- 우리 컴포넌트가 받은 동작 props를 라이브러리에 제대로 넘겼는지 (`onPress`·`disabled`를 Pressable에 연결. 끊겨도 화면만 봐선 모름)
- 버그가 났던 곳 (재발 방지)

**테스트하지 않는 것** (틀릴 여지가 없거나 이미 다른 곳에서 확인됨)

- props를 그대로 표시만 하는 렌더
- 라이브러리 **내부** 동작 (Pressable이 터치를 감지하는지 등, RN·Expo가 이미 테스트함)
- 타입으로 이미 막히는 것 (`pnpm typecheck`)
- 커버리지 숫자를 채우려는 테스트

| 테스트하지 않음 ❌                                                   | 대신 테스트함 ✅                                     |
| -------------------------------------------------------------------- | ---------------------------------------------------- |
| `label="저장"` 넣으면 "저장"이 보인다 (그대로 표시)                  | `errorMessage`가 있을 때만 에러 문구가 보인다 (분기) |
| `<Pressable>`을 직접 렌더해 누르면 `onPress`가 불린다 (RN 내부 동작) | `Button`을 누르면 `onPress`가 불린다 (우리가 연결함) |
| 필수 prop 빠지면 에러 (타입이 이미 막음)                             | —                                                    |

## 2. 다 짠 테스트 점검 (팀 규칙)

테스트 하나를 추가할 때 **아래 4개를 전부 만족**해야 함. 하나라도 아니면 고치거나 지움

| 기준             | 확인 방법                                                       |
| ---------------- | --------------------------------------------------------------- |
| 실패할 수 있음   | 대상 코드를 일부러 망가뜨리면 실패한다                          |
| 결과를 검증      | 입력 → 출력, 또는 사용자가 보는 결과(문구·이동·호출)를 검증한다 |
| 구조 변경에 강함 | 동작은 그대로 두고 내부 구현만 바꾸면 여전히 통과한다           |
| 항상 같은 결과   | 실행 순서·현재 시간·네트워크와 상관없이 같은 결과가 나온다      |

## 파일 위치

```txt
src/
├─ app/                         # ❌ 테스트 파일 금지 (전부 라우트로 인식됨)
├─ screens/__tests__/
│  └─ HomeScreen.test.tsx       # 화면 렌더 · 화면 전환 (renderRouter)
├─ components/common/__tests__/
│  └─ Button.test.tsx           # 컴포넌트 상호작용
├─ hooks/__tests__/
│  └─ useSubscriptions.test.tsx # 훅 (QueryClient 감싸서)
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

## 가짜 테스트 금지 (팀 규칙)

- **동어반복 금지**: 기대값을 구현과 같은 로직으로 계산하지 않음. 기대값은 손으로 쓴 리터럴

```ts
// ❌ 구현을 그대로 다시 씀 → 구현이 틀려도 통과
expect(formatPrice(price)).toBe(`${price.toLocaleString()}원`);
// ✅ 손으로 계산한 값
expect(formatPrice(12900)).toBe('12,900원');
```

- 테스트 대상 자체를 mock하지 않음. mock은 경계에서만: `fetch`, 네이티브 모듈, 시간(`jest.useFakeTimers`)
- 우리 컴포넌트·훅은 mock하지 않고 진짜로 렌더
- `className`·스타일 값 검증 안 함 (구현 디테일)

## 속도

- 개발 중엔 변경분만 (`jest --watch --changedSince=origin/dev`), CI에서 전체
- 실제 타이머로 기다리지 않음 → `jest.useFakeTimers()` (userEvent는 `userEvent.setup({ advanceTimers: jest.advanceTimersByTime })`)
- 느린 테스트는 범위를 줄이거나 단계를 내림 (화면 전환 → 컴포넌트 → unit)

## 이럴 때 더 읽기

- 컴포넌트를 렌더하고 누르거나 찾을 때 (RNTL) → `.claude/docs/testing/rntl.md`
- 화면 전환(버튼 → 다음 화면)을 확인할 때 → `.claude/docs/testing/navigation.md`
- API 훅이나 API를 쓰는 화면을 테스트할 때 → `.claude/docs/testing/api-hooks.md`
- 테스트 설정이 깨졌거나 Expo·Jest·RNTL 버전을 올릴 때 → `.claude/docs/testing/setup.md`
- 테스트를 새로 작성할 때 (절차) → `.claude/skills/add-test/SKILL.md`
- 실기기에서만 확인되는 동작이면 → `.claude/rules/e2e-test.md`
