---
paths:
  - '.maestro/**'
  - '.eas/workflows/**'
  - 'eas.json'
---

# E2E 테스트 규칙 (Maestro)

기준: **`package.json`에 설치된 Expo 버전의 공식 문서**와 Maestro 공식 문서 ([EAS Workflows E2E](https://docs.expo.dev/eas/workflows/examples/e2e-tests/) · [Maestro](https://docs.maestro.dev/) · [Maestro React Native](https://docs.maestro.dev/get-started/supported-platform/react-native)). 문법은 기억 말고 문서 확인

> 아래 내용은 Expo SDK 58에서 확인함. `type: maestro` job은 alpha라 SDK를 올리면 문서와 대조해 이 파일도 갱신

## E2E 대상 고르기 (팀 결정)

실기기(시뮬레이터)에서 앱을 끝까지 조작해 핵심 플로우가 동작하는지 확인. Expo 문서도 UI 검증은 스냅샷 대신 E2E(Maestro) 권장

**E2E로 확인할 것**

- 핵심 사용자 여정 (로그인 → 온보딩 → 홈)
- 실기기에서만 확인되는 것 (네이티브 모듈·권한 팝업·키보드·폰트)

**단위 테스트로 넘길 것** (Jest로 확인 가능하면 E2E에서 하지 않음, `unit-test.md`)

- 컴포넌트 상태 (disabled, 에러 문구)
- 화면 전환 하나 (`renderRouter`)
- 분기 로직 조합

## Maestro 공식 권장

### 선택자 ([React Native](https://docs.maestro.dev/get-started/supported-platform/react-native) · [Selectors](https://docs.maestro.dev/reference/selectors/core-selectors))

- 화면 텍스트로 찾는 건 "쉽지만 깨지기 쉬움" (문구 변경·번역 시 깨짐) → **`testID` 사용이 best practice**. RN `testID`는 Maestro `id`로 찾음
- `id`는 동적 콘텐츠, 텍스트 없는 아이콘, 다국어 앱에 특히 권장
- `text`는 화면 텍스트와 iOS `accessibilityLabel`을 둘 다 찾음
- `text`·`id`는 기본이 정규식 → `$`·`[` 같은 문자는 이스케이프
- 같은 선택자가 여러 개면 `index`(0부터)로 고름

### 기다리기 ([Wait commands](https://docs.maestro.dev/maestro-flows/flow-control-and-logic/wait-commands))

- 짧게 나타나거나 사라지는 요소는 assertion(`assertVisible`)으로. assertion은 요소가 나타날 때까지 계속 확인함
- 몇 초 이상 걸리는 게 확실한 경우(느린 네트워크)만 `extendedWaitUntil` + `timeout`
- "모든 timeout을 60초로 잡지 말 것". 5초 안에 뜨는 화면은 기본 assertion에 맡김
- 움직이는 요소는 `waitForAnimationToEnd`, 탭이 안 먹히면 `tapOn`에 `retryTapIfNoChange: true`

### 앱 상태 ([launchApp](https://docs.maestro.dev/reference/commands-available/launchapp))

- `launchApp`은 기본으로 실행 중인 앱을 종료하고 다시 실행 (`stopApp: true`)
- `clearState: true`: 실행 전 앱 상태 초기화. `clearKeychain: true`: iOS 키체인 전체 초기화

### 플로우 구성 ([Nested flows](https://docs.maestro.dev/maestro-flows/flow-control-and-logic/nested-flows))

- "Keep flows atomic": 서브플로우 하나는 한 가지 일만 (로그인, 로그아웃 등)
- 셋업·정리 단계는 서브플로우로 만들어 `runFlow`로 호출
- 서브플로우는 메인 테스트와 분리된 `subflows/`·`common/` 폴더에
- 값은 `runFlow`의 `env`로 넘기고 서브플로우에서 `${VAR}`로 사용

## 파일 위치

```txt
GUDOGGING-FE/
├─ .maestro/                    # 루트, eas.json과 같은 위치 (Expo 문서)
│  ├─ login.yml                 # 메인 플로우
│  └─ subflows/                 # runFlow로 호출하는 서브플로우 (Maestro 문서)
│     └─ login.yml
├─ .eas/workflows/
│  └─ e2e-tests.yml             # build → maestro job (Expo 문서)
└─ eas.json                     # build.e2e-test 프로필
```

- `src/`의 `__tests__/`에 두지 않음 (Jest가 실행하려 함)

## 작성

- `appId`는 앱 bundle ID (`app.json`의 `ios.bundleIdentifier`). 아직 지정 안 됨 → 정식 ID 정해지면 그 값으로

```yaml
# .maestro/login.yml
appId: com.example.app # app.json의 ios.bundleIdentifier로 교체
---
- launchApp:
    clearState: true
- tapOn:
    id: 'login_button'
- runFlow:
    file: subflows/login.yml
    env:
      USERNAME: 'myUser'
      PASSWORD: 'myPassword'
- assertVisible:
    id: 'home_screen'
```

## 실행 ([EAS Workflows E2E](https://docs.expo.dev/eas/workflows/examples/e2e-tests/))

- **지금은 iOS만 돌림** (프로젝트 결정). Android는 출시 결정되면 추가
- 로컬: Maestro CLI 설치 → 시뮬레이터에 앱 설치 → `maestro test .maestro/{플로우}.yml` (Expo Go 불가)
- CI: `eas.json`에 `e2e-test` 프로필 (`withoutCredentials`, iOS `simulator: true`, Android `buildType: "apk"`) + `.eas/workflows/e2e-tests.yml`의 `type: build` → `type: maestro` job (alpha)
- 트리거는 `pull_request` 또는 라벨 붙은 PR만(`pull_request_labeled`) 중 선택
