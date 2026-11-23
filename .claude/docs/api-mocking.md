# API 서버와 E2E 목서버

앱은 `request()`로 `EXPO_PUBLIC_API_URL`에 요청함. 주소만 바꾸면 서버가 바뀜

| 쓰는 곳                     | 주소                             | 설정                                 |
| --------------------------- | -------------------------------- | ------------------------------------ |
| 로컬 개발 (시뮬레이터·기기) | `https://dev-api.gudogging.com`  | `.env.example`을 `.env.local`로 복사 |
| TestFlight (EAS 빌드·OTA)   | `https://dev-api.gudogging.com`  | EAS 환경변수 production              |
| E2E (Maestro)               | `http://localhost:9090` (목서버) | `.claude/rules/e2e-test.md`          |

- 환경변수를 바꾼 뒤엔 `pnpm start -c` (캐시 초기화)
- EAS 값 바꾸기: `npx eas-cli@latest env:update production --variable-name EXPO_PUBLIC_API_URL --value <주소>`. 다음 OTA·빌드부터 반영

## E2E 목서버 (`mocks/`)

네이티브 로그인 창을 Maestro로 못 눌러 임시 토큰을 받는 서버, 실행마다 상태를 초기화하는 `/e2e/reset`이 필요해서 남겨 둠. `mocks/handlers.ts`의 MSW 핸들러를 `@msw/serve`로 띄운 로컬 HTTP 서버 (`pnpm mock`)

- 노션 API 명세서의 mock data를 도메인별 `mocks/handlers/{도메인}.ts`에. 경로는 base URL 뒤 부분(`/api/v1/...`), 응답은 `ok()`로 명세 공통 형태 `{ code, message, data }`

```ts
http.get('/api/v1/home', () => ok('홈 정보를 조회했습니다.', { summary: { ... } })),
http.post('/api/v1/subscriptions', () => ok('구독을 등록했습니다.', { ... }, 201)),
```

- E2E가 지나가는 API의 응답 모양이 서버와 달라지면 핸들러도 고침 (E2E가 서버와 다른 응답으로 통과하지 않게)
- `POST /e2e/reset`은 `E2E=1 pnpm mock`일 때만 등록 (`mocks/handlers/e2e.ts`)
- 고정 경로(`/subscriptions/drafts`)는 `/:subscriptionId`보다 먼저 등록 (MSW는 먼저 맞는 핸들러로 응답)
- `mocks/`는 `src/` 밖이라 앱 번들에 안 들어감. 앱 코드에서 import 금지
- http 목서버는 iOS 시뮬레이터 `localhost`에서 동작 (`NSAllowsLocalNetworking`)
