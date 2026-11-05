# API 쓰는 훅 · 화면 테스트

- 테스트마다 새 `QueryClient` (`retry: false`). 테스트끼리 캐시 공유 금지
- 네트워크는 `jest.spyOn(globalThis, 'fetch')`로 응답 고정. 실제 서버 호출 금지
- spy는 `afterEach(() => jest.restoreAllMocks())`로 복원 (다음 테스트로 mock이 넘어감)
- 성공 · 에러(4xx/5xx) · 로딩 각각 검증

## 이럴 때 더 읽기

- 테스트할 훅의 규칙(queryKey·request)을 확인할 때 → `.claude/rules/data-fetching.md`
