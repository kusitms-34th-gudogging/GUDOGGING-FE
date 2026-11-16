# API 목서버 (Swagger 배포 전)

`mocks/handlers.ts`의 MSW 핸들러를 `@msw/serve`로 띄운 로컬 HTTP 서버. 앱은 `request()`로 실제 요청을 보내므로 실서버로 바꿀 땐 `EXPO_PUBLIC_API_URL`만 교체

## 쓰는 법

1. `.env.example`을 `.env.local`로 복사하고 `EXPO_PUBLIC_API_URL=http://localhost:9090` 채움
2. 터미널 하나에서 `pnpm mock`, 다른 하나에서 `pnpm start -c` (환경변수 바꾼 뒤엔 캐시 초기화)
3. 명세 보고 `mocks/handlers.ts`에 추가. 경로는 base URL 뒤에 붙는 부분, 응답 형태는 명세 그대로

```ts
http.get('/subscriptions', () => HttpResponse.json([{ id: 1, name: '넷플릭스' }])),
http.post('/subscriptions', () => HttpResponse.json({ message: '중복' }, { status: 409 })),
```

## 주의

- `mocks/`는 `src/` 밖이라 앱 번들에 안 들어감. 앱 코드에서 import 금지
- http 목서버는 iOS 시뮬레이터 `localhost`에서 동작 (`NSAllowsLocalNetworking`). 실기기는 PC의 LAN IP(`http://192.168.x.x:9090`)로
- 실서버로 바꾸면 핸들러와 실제 응답이 다른 곳을 확인하고 훅 타입을 고침. 다 옮기면 `mocks/`·`pnpm mock`·`msw`·`@msw/serve` 삭제
