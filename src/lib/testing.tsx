import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// API 쓰는 화면 테스트 공통 (.claude/docs/testing/api-hooks.md)

// 테스트마다 새 QueryClient. 재시도 없이 바로 에러
export const createQueryWrapper = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const QueryWrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return QueryWrapper;
};

type Routes = Record<string, unknown>;

// 'GET /api/v1/home' 같은 키로 응답 data 고정. 없는 경로는 404
// 값이 { status }면 그 상태 코드로 실패
export const mockApi = (routes: Routes) =>
  jest.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const { pathname } = new URL(String(input));
    const route = routes[`${init?.method ?? 'GET'} ${pathname}`];
    if (route === undefined) return new Response(null, { status: 404 });
    const status = (route as { status?: number }).status;
    if (status) return new Response(JSON.stringify({ code: status, data: null }), { status });
    return new Response(JSON.stringify({ code: 200, message: '', data: route }));
  });
