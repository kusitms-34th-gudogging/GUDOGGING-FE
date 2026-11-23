import { http } from 'msw';

// 서버에 나온 API만 개발 서버로 넘기고 나머지는 목 응답. `pnpm mock:dev`일 때만 등록 (handlers.ts)
// API가 나오면 경로를 여기 추가하고, 다 나오면 앱 EXPO_PUBLIC_API_URL을 개발 서버로 바꾸고 mocks/ 삭제
// /subscriptions는 등록(POST)과 같은 경로라 구독 목록 조회(GET)·삭제(DELETE)도 개발 서버로 감
const PROXY_PATHS = [
  '/api/v1/auth/apple',
  '/api/v1/auth/google',
  '/api/v1/auth/reissue',
  '/api/v1/auth/logout',
  '/api/v1/calendar',
  '/api/v1/gmail/connection',
  '/api/v1/gmail/analyses',
  '/api/v1/home',
  // 알림 목록·읽음 처리·알림 설정 조회(GET)·변경(PATCH)·푸시 토큰 등록
  '/api/v1/notifications',
  '/api/v1/notifications/:notificationId/read',
  '/api/v1/notifications/settings',
  '/api/v1/notifications/tokens',
  '/api/v1/services',
  '/api/v1/subscriptions/drafts',
  '/api/v1/subscriptions/screenshots/analyses',
  // 구독 상세 조회(GET)·수정(PATCH). /drafts도 이 모양에 맞지만 위에서 이미 넘김
  '/api/v1/subscriptions/:subscriptionId',
  '/api/v1/subscriptions/:subscriptionId/steady',
  '/api/v1/subscriptions/:subscriptionId/cancel-guide',
  '/api/v1/subscriptions/:subscriptionId/cancel',
  '/api/v1/subscriptions/:subscriptionId/reactivate',
  '/api/v1/subscriptions',
  '/api/v1/subscriptions/:subscriptionId/checkups',
  '/api/v1/subscriptions/:subscriptionId/checkups/form',
  '/api/v1/checkups/:checkupId',
  '/api/v1/checkups/:checkupId/decision',
  // 내 정보 조회(GET)·회원 탈퇴(DELETE)
  '/api/v1/users/me',
];

const upstream = process.env.DEV_API_URL;

// fetch가 압축을 풀어 주므로 길이·인코딩 헤더는 원본과 안 맞음 → 빼고 돌려줌
const DROP_HEADERS = ['content-encoding', 'content-length', 'transfer-encoding'];

export const proxyHandlers = upstream
  ? PROXY_PATHS.map((path) =>
      http.all(path, async ({ request }) => {
        const { pathname, search } = new URL(request.url);
        const headers = new Headers(request.headers);
        headers.delete('host');
        const res = await fetch(`${upstream}${pathname}${search}`, {
          method: request.method,
          headers,
          body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer(),
        });
        // 개발 서버로 넘긴 요청을 터미널에서 확인 (목 응답은 안 찍힘)
        console.log(`[dev] ${request.method} ${pathname}${search} → ${res.status}`);
        const resHeaders = new Headers(res.headers);
        DROP_HEADERS.forEach((name) => resHeaders.delete(name));
        return new Response(await res.arrayBuffer(), { status: res.status, headers: resHeaders });
      }),
    )
  : [];
