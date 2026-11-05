---
paths:
  - 'src/hooks/**'
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
- 서버 데이터를 `useState`·전역 상태에 복사하지 않음. 캐시가 원본
- HTTP는 RN 기본 **`fetch`**(RN 공식 권장)만. axios 추가하지 않음 (업로드 진행률 등 필요해지면 그때 논의)

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

## 이럴 때 더 읽기

- `request`·QueryClient·`_layout.tsx` Provider를 만들거나 고칠 때 → `.claude/rules/api-client.md`
- API 훅·화면 테스트를 짤 때 → `.claude/docs/testing/api-hooks.md`
- `src/app/api`·`src/server`(BFF)를 쓸지 → `.claude/rules/server-env.md`
- 새 파일 위치가 애매할 때 → `.claude/docs/architecture.md`
