---
paths:
  - 'src/lib/**'
  - 'src/app/_layout.tsx'
---

# API 클라이언트 규칙 (request · QueryClient)

> React Native 0.88 · TanStack Query 5에서 확인함. 버전을 올리면 해당 버전 문서와 대조해 갱신

## request (`src/lib/request.ts`)

- baseURL(`EXPO_PUBLIC_API_URL`), 공통 헤더, JSON 변환, 에러 변환을 한 곳에서
- `!res.ok`면 `ApiError(status, body)` throw. `fetch` 에러는 catch 안 하면 조용히 사라짐(RN 문서) → 훅·화면에서 `fetch` 직접 호출 금지
- 인증은 **헤더 토큰**. RN fetch의 쿠키 인증은 불안정(RN 문서) → 쿠키 세션 쓰지 않음
- 토큰은 `expo-secure-store`에 저장. AsyncStorage에 두지 않음
- 401 → 토큰 갱신 후 1회 재요청도 `request()` 안에서만
- API 주소는 **HTTPS**. iOS ATS·Android(API 28+)가 http를 막음. 예외가 필요하면 `ios/`·`android/` 말고 `app.json`·config plugin으로

## QueryClient 설정

- `src/lib/queryClient.ts`에서 생성, `_layout.tsx`에서 `QueryClientProvider`로 한 번만 감쌈
- 4xx(`ApiError` status < 500)는 재시도 안 함, 그 외 최대 2회
- 앱 복귀 시 refetch: `useAppStateFocus`에서 `AppState` 변경 → `focusManager.setFocused(status === 'active')` (`Platform.OS !== 'web'`일 때만)
- 화면 복귀 시 refetch가 필요하면 그 화면에서 `useFocusEffect`(`expo-router`에서 export됨, 확인함)로 `refetch`. 마운트 때도 호출되므로 첫 호출은 건너뜀
- 오프라인 감지(`onlineManager`)는 오프라인 UX가 기획에 생기면 추가. 그때 Expo 모듈 `expo-network` 사용
- 테스트에서는 이 인스턴스 말고 테스트용 `QueryClient` 새로 만듦

## 이럴 때 더 읽기

- API 훅·queryKey를 다룰 때 → `.claude/rules/data-fetching.md`
- 환경변수·비밀 키를 다룰 때 → `.claude/rules/server-env.md`
