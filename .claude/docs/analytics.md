# GA4 이벤트 (Firebase Analytics)

이벤트 이름·파라미터·심는 위치는 기획 명세("GA 세팅")를 따르고, 여기엔 코드 쪽 규칙만

## 구조

- 전송은 `src/lib/analytics.ts`의 `track(이름, 파라미터)` 하나로. 화면·훅에서 `@react-native-firebase/analytics`를 직접 import하지 않음
- 이벤트는 같은 파일 `AnalyticsEvents` 타입에 먼저 추가 → 이름·파라미터 오타는 typecheck가 잡음
- `track`은 오류를 삼킴 (수집 실패가 앱 동작을 막지 않게). 그래서 안 찍혀도 콘솔엔 아무것도 안 나옴 → 아래 "확인"으로
- user_id는 `identifyUser`(로그인·세션 복원)·`clearAnalyticsUser`(`clearAccountData`)만 씀. 회원 ID 외 개인정보(이메일 등) 넣지 않음 (Google 정책)

## 이벤트 추가·수정할 때

- 이름·파라미터는 snake_case, 이름 40자·값 100자 이내
- 구독 하나에 대한 이벤트는 `service_name`·`category`를 같이 보냄
- 값은 문자열·숫자만. boolean은 `'true'`·`'false'` 문자열로 (GA 측정기준에서 보기 쉽게)
- 서버 요청 결과에 따른 이벤트는 화면 콜백보다 훅의 `onSuccess`·`onError`에 (호출처가 여럿이어도 한 번에). 화면을 떠나 취소된 요청(`signal.aborted`)은 실패로 세지 않음
- "어디서 들어왔는지"처럼 이전 화면 정보가 필요하면 라우트 파라미터 `from`으로 넘기고, 라우트 파일에서 허용 값만 골라 화면 props로 (예: `src/app/checkup/[id]/index.tsx`)
- 새 파라미터를 추가하면 GA4 관리 → 맞춤 정의에도 등록해야 보고서에서 쓸 수 있음 (등록 시점부터만 집계) → 기획·GA 권한자에게 공유
- 테스트에서 네이티브 모듈은 `jest-setup.ts`가 mock. 보낸 이벤트는 `jest.mocked(logEvent)`로 확인 (예: `src/hooks/__tests__/useAnalyzeSubscriptions.test.tsx`)

## 확인

- 네이티브 모듈이라 Expo Go·기존 개발 빌드에선 안 됨 → `npx expo run:ios`로 다시 빌드
- 시뮬레이터를 디버그 모드로 실행: `xcrun simctl launch booted com.subscribers.gudogging -FIRDebugEnabled` (끌 땐 `-FIRDebugDisabled`)
- 보낸 이벤트 실시간 확인: `xcrun simctl spawn booted log stream --level debug --predicate 'subsystem CONTAINS "firebase" AND eventMessage CONTAINS "Logging event"'`
- DebugView는 1~2분 늦고 타임라인 시각이 어긋나기도 함. 이벤트가 나가는지는 시뮬레이터 로그 스트림의 `Logging event`로 판단
