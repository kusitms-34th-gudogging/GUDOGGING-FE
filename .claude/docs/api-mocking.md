# API 목서버 (Swagger 배포 전)

`mocks/handlers.ts`의 MSW 핸들러를 `@msw/serve`로 띄운 로컬 HTTP 서버. 앱은 `request()`로 실제 요청을 보내므로 실서버로 바꿀 땐 `EXPO_PUBLIC_API_URL`만 교체

## 쓰는 법

1. `.env.example`을 `.env.local`로 복사하고 `EXPO_PUBLIC_API_URL=http://localhost:9090` 채움
2. 터미널 하나에서 `pnpm mock`, 다른 하나에서 `pnpm start -c` (환경변수 바꾼 뒤엔 캐시 초기화)
3. 노션 API 명세서의 mock data를 도메인별 `mocks/handlers/{도메인}.ts`에 옮김. 경로는 base URL 뒤 부분(`/api/v1/...`), 응답은 `ok()`로 명세 공통 형태 `{ code, message, data }`

```ts
http.get('/api/v1/home', () => ok('홈 정보를 조회했습니다.', { summary: { ... } })),
http.post('/api/v1/subscriptions', () => ok('구독을 등록했습니다.', { ... }, 201)),
```

- E2E용 상태 초기화 `POST /e2e/reset`은 `E2E=1 pnpm mock`일 때만 등록 (`mocks/handlers/e2e.ts`). 사용법은 `.claude/rules/e2e-test.md`
- 고정 경로(`/subscriptions/drafts`)는 `/:subscriptionId`보다 먼저 등록 (MSW는 먼저 맞는 핸들러로 응답)

## 주의

- `mocks/`는 `src/` 밖이라 앱 번들에 안 들어감. 앱 코드에서 import 금지
- http 목서버는 iOS 시뮬레이터 `localhost`에서 동작 (`NSAllowsLocalNetworking`). 실기기는 PC의 LAN IP(`http://192.168.x.x:9090`)로
- 실서버로 바꾸면 핸들러와 실제 응답이 다른 곳을 확인하고 훅 타입을 고침. 다 옮기면 `mocks/`·`pnpm mock`·`msw`·`@msw/serve` 삭제
