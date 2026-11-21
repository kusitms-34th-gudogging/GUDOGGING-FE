import { authHandlers } from './handlers/auth.ts';
import { calendarHandlers } from './handlers/calendar.ts';
import { checkupHandlers } from './handlers/checkup.ts';
import { e2eHandlers } from './handlers/e2e.ts';
import { gmailHandlers } from './handlers/gmail.ts';
import { homeHandlers } from './handlers/home.ts';
import { notificationHandlers } from './handlers/notification.ts';
import { proxyHandlers } from './handlers/proxy.ts';
import { serviceHandlers } from './handlers/service.ts';
import { subscriptionHandlers } from './handlers/subscription.ts';
import { userHandlers } from './handlers/user.ts';

// 노션 API 명세서의 mock data 기준. 명세가 바뀌면 해당 도메인 파일만 고침
export const handlers = [
  // 개발 서버로 넘길 경로가 목 핸들러보다 먼저 (MSW는 먼저 맞는 핸들러로 응답)
  ...proxyHandlers,
  ...authHandlers,
  ...userHandlers,
  ...homeHandlers,
  ...calendarHandlers,
  ...checkupHandlers,
  ...subscriptionHandlers,
  ...serviceHandlers,
  ...gmailHandlers,
  ...notificationHandlers,
  // 테스트할 때만: 상태 초기화 API
  ...(process.env.E2E === '1' ? e2eHandlers : []),
];
