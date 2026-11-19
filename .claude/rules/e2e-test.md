---
paths:
  - '.maestro/**'
---

# E2E 테스트 규칙 (Maestro)

기준: [Maestro](https://docs.maestro.dev/) · [Maestro React Native](https://docs.maestro.dev/get-started/supported-platform/react-native). 문법은 기억 말고 문서 확인

## 왜 Maestro, 왜 EAS Workflows가 아닌가

- Maestro는 빌드된 앱을 밖에서 조작함. 앱에 넣는 코드·네이티브 설정이 없어 CNG와 맞음
- EAS Workflows `type: maestro` job은 쓰지 않음: 무료 플랜에서 실행 불가 ([Expo pricing](https://expo.dev/pricing)), workflow 안의 빌드도 iOS 빌드 한도에서 빠짐
- 대신 앱은 로컬 Xcode로 시뮬레이터 빌드 (서명 불필요, EAS 횟수 무관)

## E2E 대상 고르기

E2E는 적게, 제품 핵심 가치를 지나는 **사용자 여정** 단위로 ([The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html): "Write _very few_ high-level tests"). 도메인마다 하나씩 짜지 않음

**E2E로 확인할 것** (실기기에서만 확인되는 것)

- 여러 화면·도메인을 지나는 여정 (예: 등록한 구독이 홈에 보임)
- 네이티브 동작: OS 권한 팝업, SecureStore 토큰 유지, 키보드, 내비게이션 스택(뒤로 가기)

**Jest로 넘길 것** (Jest로 확인 가능하면 E2E에서 하지 않음)

- 화면 하나 안의 상태·문구·분기, 화면 전환 하나(`renderRouter`)

**지금 있는 여정** (`.maestro/`, 전체 약 4분 20초. 실행 시간·깨지는 빈도를 보고 더 늘릴지 정함)

1. `auth-login-to-home`: 로그인 → 온보딩 → 알림 권한 → 홈. 재실행 후 로그인 유지는 세션 확인(S-01) 구현 후 추가
2. `register-manual-shows-on-home`: 직접 등록 → 홈 구독 수·구독 관리에 보임
3. `checkup-to-cancel`: 점검 → 해지 이유 → 해지 안내(외부 링크 갔다 옴) → 구독 종료
4. `auth-logout`: 마이페이지 → 로그아웃 → 로그인 화면

**지금 제외**: 사진 보관함(스크린샷 등록)·Google 인증 창(Gmail)은 앱 밖 시스템 화면이라 조작 여부 미확인. 캘린더는 Jest로

## 선택자 ([React Native](https://docs.maestro.dev/get-started/supported-platform/react-native) · [Selectors](https://docs.maestro.dev/reference/selectors/core-selectors))

- **`testID` 우선** (문구 변경에 안 깨짐). RN `testID`는 Maestro `id`로 찾음
- `testID`는 E2E 여정이 누르거나 확인하는 요소에만 붙임. 공통 컴포넌트가 `testID` prop을 안 받으면 optional prop으로 추가해 `Pressable` 등에 그대로 넘김
- 이름은 kebab-case `{화면}-{요소}` (예: `login-apple`, `home-screen`)
- `text`·`id`는 기본이 정규식이고 **전체 일치** → `$`·`[` 같은 문자는 이스케이프. 같은 선택자가 여러 개면 `index`(0부터)
- 행 전체가 버튼인 목록(`ListItem` 등)은 안쪽 글자 대신 접근성 라벨(예: `Spotify 상세`)로 보임 → 내용 확인은 `'Spotify.*'`처럼
- 외부 링크(Safari·App Store)로 나갔다 돌아오는 건 `launchApp: { stopApp: false }`

## 목서버

- E2E는 `pnpm mock`을 **새로 띄워서** 돌림. Render 목서버는 쓰지 않음
  - 목서버 상태가 메모리에 있어서 결과가 바뀜: 첫 로그인만 신규 가입(`isNewUser`) → 온보딩, 이후는 홈 (`mocks/handlers/auth.ts`)
  - Render 무료 플랜은 잠들었다 깨면 상태 초기화, 팀원끼리 상태 공유
- 실행 전마다 목서버를 처음 상태로 (가입 상태가 남으면 다음 실행은 온보딩 없이 홈으로 감): `E2E=1 pnpm mock`으로 띄우고 `curl -X POST http://localhost:9090/e2e/reset`, 또는 목서버 재시작
  - `/e2e/reset`은 `E2E=1`일 때만 생김 (`mocks/handlers/e2e.ts`). Render 공용 목서버엔 없음
- 앱은 **Release**로 빌드해야 셸에서 준 `EXPO_PUBLIC_API_URL`이 들어감. 개발 빌드는 `expo/virtual/env.js`가 `.env.local` 값을 셸 값 위에 덮어써서 Render로 요청함

## 권한 ([launchApp](https://docs.maestro.dev/reference/commands-available/launchapp) · [setPermissions](https://docs.maestro.dev/reference/commands-available/setpermissions))

- 기본값은 모든 권한 허용. 단 iOS 알림은 시스템 팝업이 뜨고, Maestro가 영어 시뮬레이터에선 Allow를 자동으로 누르지만 한국어 시뮬레이터에선 안 누름 → 플로우에서 `tapOn`(`text: '허용|Allow'`, `optional: true`)
- 실패한 실행이 팝업을 띄운 채 끝나면 다음 실행에서 팝업이 화면을 가림 → 시뮬레이터에서 팝업을 닫고 다시 실행
- 거부 경로는 `launchApp`의 `permissions` (`all: deny` 후 필요한 것만 `allow`). 플로우 중간엔 `setPermissions`

## 로그인

- 지금은 Apple·Google SDK가 없어 버튼 탭만으로 로그인됨 (`src/hooks/useLogin.ts`)
- SDK를 붙이면 네이티브 로그인 창은 조작 불가 → E2E 빌드에서만 켜지는 JS 우회 경로를 추가 (네이티브 변경 없이)

## 기다리기 ([Wait commands](https://docs.maestro.dev/maestro-flows/flow-control-and-logic/wait-commands))

- 나타나거나 사라지는 요소는 `assertVisible`로 (나타날 때까지 계속 확인)
- 몇 초 이상 걸리는 게 확실한 경우만 `extendedWaitUntil` + `timeout`. 모든 timeout을 길게 잡지 않음
- 움직이는 요소는 `waitForAnimationToEnd`, 탭이 안 먹히면 `tapOn`에 `retryTapIfNoChange: true`

## 파일 위치

```txt
.maestro/
├─ auth-login-to-home.yml     # 여정 하나 = 파일 하나. 루트에만 둠
└─ subflows/                  # runFlow로 호출하는 공통 단계 (로그인 등)
   └─ login.yml
```

- `maestro test .maestro/`는 루트의 YAML만 실행 (`config.yaml` `flows` 기본값 `*`, [Workspace configuration](https://docs.maestro.dev/api-reference/configuration/workspace-configuration)) → 여정은 루트에, 서브플로우는 `subflows/`에 두면 테스트로 안 돌아감. 도메인 폴더로 나누지 않음
- 파일 이름은 `{도메인}-{여정}.yml` (예: `auth-login-to-home.yml`, `checkup-to-cancel.yml`). 여러 도메인을 지나면 시작 도메인. 파일이 많아져 폴더로 나눌 땐 `config.yaml`에 `flows: ['**', '!subflows/**']`
- 서브플로우 하나는 한 가지 일만 ([Nested flows](https://docs.maestro.dev/maestro-flows/flow-control-and-logic/nested-flows)). 값은 `runFlow`의 `env`로 넘김
- `src/`의 `__tests__/`에 두지 않음 (Jest가 실행하려 함)

## 작성

- `appId`는 `app.json`의 `ios.bundleIdentifier`

```yaml
# .maestro/auth-login-to-home.yml
appId: com.subscribers.gudogging
---
- launchApp:
    clearState: true
    clearKeychain: true # 토큰이 iOS 키체인(SecureStore)에 남음
- tapOn:
    id: 'login-apple'
- assertVisible:
    id: 'home-screen'
```

## 실행

- **지금은 iOS만** (프로젝트 결정)
- 준비 (한 번): Java 17 (`brew install openjdk@17` + PATH), Maestro CLI (`curl -Ls "https://get.maestro.mobile.dev" | bash`). 앱이 아니라 Mac에 설치
- 빌드 (처음, 앱 코드가 바뀌었을 때): `EXPO_PUBLIC_API_URL=http://localhost:9090 npx expo run:ios --configuration Release --no-bundler`
  - `ios/`가 없으면 prebuild가 돌며 `package.json` `scripts`를 바꿈 → 커밋하지 말고 되돌림 (`.claude/docs/deploy.md`)
- 실행: `E2E=1 pnpm mock`을 띄워 두고 `sh scripts/e2e.sh` (플로우마다 초기화 후 `maestro test`, 하나만 돌릴 땐 `sh scripts/e2e.sh .maestro/{도메인}-{여정}.yml`)
  - `package.json` `scripts`에 넣지 않음: 네이티브 지문(`packageJson:scripts`)이 바뀌어 dev 머지 때 EAS 빌드가 돎
- `auth-login-to-home` 기준 약 70초 (로컬 iPhone 시뮬레이터)
- CI는 GitHub Actions 기본 macOS runner로 돌려 본 뒤 이 문서에 추가

## 이럴 때 더 읽기

- 플로우를 새로 작성할 때 → `.claude/skills/add-test/SKILL.md`
- Jest로 넘길지 판단할 때 → `.claude/rules/unit-test.md` "범위"
- 공통 컴포넌트에 `testID` prop을 추가할 때 → `.claude/rules/components.md`
