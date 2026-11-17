# API 쓰는 훅 · 화면 테스트

- 테스트마다 새 `QueryClient` (`retry: false`). 테스트끼리 캐시 공유 금지
- 네트워크는 `jest.spyOn(globalThis, 'fetch')`로 응답 고정. 실제 서버 호출 금지
- spy는 `afterEach(() => jest.restoreAllMocks())`로 복원 (다음 테스트로 mock이 넘어감)
- 성공 · 에러(4xx/5xx) · 로딩 각각 검증
- 헬퍼는 `src/lib/testing.tsx`: `renderRouter(..., { wrapper: createQueryWrapper() })` + `mockApi({ 'GET /api/v1/home': data })` (응답 `data`만 넘김, `apiError(500)`이면 실패, 없는 경로는 404)
- API 쓰는 화면을 다른 테스트가 같이 렌더하면 그 테스트에도 wrapper와 `mockApi({})` (안 그러면 QueryClient 없음 에러)

## 이럴 때 더 읽기

- 테스트할 훅의 규칙(queryKey·request)을 확인할 때 → `.claude/rules/data-fetching.md`
