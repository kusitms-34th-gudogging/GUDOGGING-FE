import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

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
