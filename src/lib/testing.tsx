import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import type { ReactNode } from 'react';

import { ToastProvider } from '@/components/common/ToastProvider';
import type { FoundSubscription } from '@/constants/services';

// API 쓰는 화면 테스트 공통 (.claude/docs/testing/api-hooks.md)

// 테스트마다 새 QueryClient. 재시도 없이 바로 에러
// gcTime Infinity: 캐시 정리 타이머(기본 5분)가 남아 실제 타이머 테스트에서 Jest가 안 끝나는 것 방지
export const createQueryWrapper = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { gcTime: Infinity },
    },
  });
  const QueryWrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return QueryWrapper;
};

type Routes = Record<string, unknown>;

// 응답 data와 구분되는 실패 표시 (data에 status 필드가 있어도 헷갈리지 않게)
class ApiErrorResponse {
  constructor(readonly status: number) {}
}
export const apiError = (status: number) => new ApiErrorResponse(status);

// 'GET /api/v1/home' 같은 키로 응답 data 고정. 없는 경로는 404, apiError(500)이면 그 상태 코드로 실패
export const mockApi = (routes: Routes) =>
  jest.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const { pathname } = new URL(String(input));
    const route = routes[`${init?.method ?? 'GET'} ${pathname}`];
    if (route === undefined) return new Response(null, { status: 404 });
    if (route instanceof ApiErrorResponse) {
      return new Response(JSON.stringify({ code: route.status, data: null }), {
        status: route.status,
      });
    }
    return new Response(JSON.stringify({ code: 200, message: '', data: route }));
  });

// 서비스 목록 응답 (GET /api/v1/services). 등록 화면 테스트 공통, id는 읽기 쉬운 값
export const TEST_SERVICES = [
  ['netflix', 'Netflix', 'VIDEO_OTT', 13500],
  ['chatgpt', 'ChatGPT', 'PRODUCTIVITY_AI', null],
  ['youtube', 'YouTube Premium', 'VIDEO_OTT', 14900],
  ['spotify', 'Spotify', 'MUSIC', 10900],
  ['coupang', '쿠팡 와우', 'SHOPPING_DELIVERY', 7890],
  ['disney', '디즈니+', 'VIDEO_OTT', 9900],
  ['tving', '티빙', 'VIDEO_OTT', 13900],
].map(([serviceId, serviceName, category, defaultAmount]) => ({
  serviceId,
  serviceName,
  category,
  logoUrl: '',
  defaultAmount,
}));

// 분석으로 불러온 구독 (draft의 found). 등록 화면 테스트 공통
// ChatGPT Plus(금액)·Netflix(결제일)는 사전 등록 서비스로 인식됐지만 확인 필요, 밀리의 서재(금액·결제일)는 직접 입력처럼 다루는 확인 필요, YouTube Premium은 바로 등록 가능
export const TEST_FOUND: FoundSubscription[] = [
  {
    id: 'found-chatgpt',
    serviceId: 'chatgpt',
    name: 'ChatGPT Plus',
    payment: {
      category: '생산성·AI',
      amount: 29000,
      cycle: 1,
      unit: '개월',
      nextDate: new Date(2026, 10, 12),
      paidAt: 'appstore',
    },
    needsReview: true,
    reviewFields: ['AMOUNT'],
  },
  {
    id: 'custom-found-millie',
    name: '밀리의 서재',
    payment: { category: '교육·학습', amount: 9900, cycle: 1, unit: '개월', paidAt: 'web' },
    needsReview: true,
    reviewFields: ['AMOUNT', 'NEXT_BILLING_DATE'],
  },
  {
    id: 'found-netflix',
    serviceId: 'netflix',
    name: 'Netflix',
    payment: { category: '영상·OTT', amount: 13500, cycle: 1, unit: '개월', paidAt: 'web' },
    needsReview: true,
    reviewFields: ['NEXT_BILLING_DATE'],
  },
  {
    id: 'found-youtube',
    serviceId: 'youtube',
    name: 'YouTube Premium',
    payment: {
      category: '영상·OTT',
      amount: 17000,
      cycle: 1,
      unit: '개월',
      nextDate: new Date(2026, 10, 12),
      paidAt: 'appstore',
    },
  },
];

// 토스트를 띄우는 화면의 renderRouter 루트 레이아웃 (앱에선 루트 _layout이 감쌈)
export const ToastLayout = () => (
  <ToastProvider>
    <Slot />
  </ToastProvider>
);
