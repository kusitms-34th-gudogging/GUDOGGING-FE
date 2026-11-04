---
paths:
  - 'src/hooks/**'
  - 'src/screens/**'
  - 'src/lib/**'
  - 'src/app/_layout.tsx'
---

# API 호출 규칙 (TanStack Query · fetch)

기준: **`package.json`에 설치된 버전의 공식 문서** ([RN Networking](https://reactnative.dev/docs/network) · [TanStack Query React Native](https://tanstack.com/query/latest/docs/framework/react/react-native)). API는 기억 말고 문서 확인

> 아래 내용은 React Native 0.88 · TanStack Query 5에서 확인함. 버전을 올리면 해당 버전 문서와 대조해 이 파일도 갱신

## 파일 위치

```txt
src/
├─ app/_layout.tsx          # QueryClientProvider 감싸기 + useAppStateFocus() 호출만
├─ lib/                     # 외부 라이브러리 설정·인스턴스 (부수효과 있음, utils와 구분)
│  ├─ request.ts            # fetch 래퍼 + ApiError (모든 요청이 여기를 거침)
│  └─ queryClient.ts        # QueryClient 인스턴스 + 기본 옵션 (앱에 하나)
├─ hooks/
│  ├─ useAppStateFocus.ts   # focusManager ↔ AppState 연결
│  ├─ useSubscriptions.ts   # 조회: subscriptionKeys + useSubscriptions / useSubscription
│  └─ useCreateSubscription.ts  # 변경: useMutation
├─ screens/                 # 훅 호출, 로딩·에러 UI, 결과를 props로 내림
└─ types/                   # 응답 타입이 여러 훅에서 공유될 때만
```

- 리소스 하나 = 조회 훅 파일 하나(`use{리소스}.ts`, `{리소스}Keys` 포함). 변경은 `use{동사}{리소스}.ts`
- 별도 `api/`·`services/` 폴더 만들지 않음. 엔드포인트 호출은 훅의 `queryFn`/`mutationFn` 안에서 `request()`로
- `src/app/api/`(라우트)·`src/server/`(로직)는 Expo 서버 API(BFF) 자리. 앱이 백엔드(Swagger API)를 호출하는 코드는 여기 두지 않음 → `hooks/`에서 `request()`로

## 흐름

```txt
lib/request.ts  →  hooks/useXxx.ts (useQuery/useMutation)  →  screens/  →  components/ (props)
```

- 서버 데이터는 **전부 TanStack Query로**. `useEffect` + `fetch` + `useState` 조합 금지
- 컴포넌트에서 API 호출 금지 (`components.md`). 화면이 훅을 쓰고 props로 넘김
- 서버 데이터를 `useState`·전역 상태에 복사하지 않음. 캐시가 원본
- HTTP는 RN 기본 **`fetch`**(RN 공식 권장)만. axios 추가하지 않음 (업로드 진행률 등 필요해지면 그때 논의)

## request (`src/lib/request.ts`)

- baseURL(`EXPO_PUBLIC_API_URL`), 공통 헤더, JSON 변환, 에러 변환을 한 곳에서
- `!res.ok`면 `ApiError(status, body)` throw. `fetch` 에러는 catch 안 하면 조용히 사라짐(RN 문서) → 훅·화면에서 `fetch` 직접 호출 금지
- 인증은 **헤더 토큰**. RN fetch의 쿠키 인증은 불안정(RN 문서) → 쿠키 세션 쓰지 않음
- 토큰은 `expo-secure-store`에 저장. AsyncStorage·`EXPO_PUBLIC_*`에 두지 않음
- 401 → 토큰 갱신 후 1회 재요청도 `request()` 안에서만
- API 주소는 **HTTPS**. iOS ATS·Android(API 28+)가 http를 막음. 예외가 필요하면 `ios/`·`android/` 말고 `app.json`·config plugin으로

## 훅

- `queryFn`의 `signal`을 `request()`에 넘김 (안 넘기면 화면 떠나도 요청 취소 안 됨)
- 응답 타입은 훅 파일 안에. 여러 훅이 공유하면 그때 `src/types/`로

```ts
// src/hooks/useSubscriptions.ts
import { useQuery } from '@tanstack/react-query';

import { request } from '@/lib/request';

interface Subscription {
  id: number;
  name: string;
}

export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  list: (page: number) => [...subscriptionKeys.all, 'list', { page }] as const,
};

export const useSubscriptions = (page: number) =>
  useQuery({
    queryKey: subscriptionKeys.list(page),
    queryFn: ({ signal }) => request<Subscription[]>(`/subscriptions?page=${page}`, { signal }),
  });
```

## queryKey

- 최상위는 배열, 리소스 이름이 첫 요소: `['subscriptions', 'list', { page }]`
- `queryFn`이 쓰는 변수는 전부 키에 포함 (TanStack 공식)
- 키는 `{리소스}Keys`에서만 만듦. 배열 손으로 다시 쓰지 않음 (invalidate 누락 원인)

## mutation

- 성공 후 관련 쿼리 `invalidateQueries({ queryKey: subscriptionKeys.all })`
- 낙관적 업데이트는 디자인상 즉시 반영이 필요할 때만
- 성공·실패 피드백은 화면에서 `useToast().show(...)`. 훅 안에서 UI 호출하지 않음

## QueryClient 설정

- `src/lib/queryClient.ts`에서 생성, `_layout.tsx`에서 `QueryClientProvider`로 한 번만 감쌈
- 4xx(`ApiError` status < 500)는 재시도 안 함, 그 외 최대 2회
- 앱 복귀 시 refetch: `useAppStateFocus`에서 `AppState` 변경 → `focusManager.setFocused(status === 'active')` (`Platform.OS !== 'web'`일 때만)
- 화면 복귀 시 refetch가 필요하면 그 화면에서 `useFocusEffect`(`expo-router`에서 export됨, 확인함)로 `refetch`. 마운트 때도 호출되므로 첫 호출은 건너뜀
- 오프라인 감지(`onlineManager`)는 오프라인 UX가 기획에 생기면 추가. 그때 Expo 모듈 `expo-network` 사용
- 테스트에서는 이 인스턴스 말고 테스트용 `QueryClient` 새로 만듦 (`unit-test.md`)
