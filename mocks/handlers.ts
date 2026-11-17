import { authHandlers } from './handlers/auth.ts';
import { calendarHandlers } from './handlers/calendar.ts';
import { checkupHandlers } from './handlers/checkup.ts';
import { gmailHandlers } from './handlers/gmail.ts';
import { homeHandlers } from './handlers/home.ts';
import { notificationHandlers } from './handlers/notification.ts';
import { serviceHandlers } from './handlers/service.ts';
import { subscriptionHandlers } from './handlers/subscription.ts';
import { userHandlers } from './handlers/user.ts';

// 노션 API 명세서의 mock data 기준. 명세가 바뀌면 해당 도메인 파일만 고침
export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...homeHandlers,
  ...calendarHandlers,
  ...checkupHandlers,
  ...subscriptionHandlers,
  ...serviceHandlers,
  ...gmailHandlers,
  ...notificationHandlers,
];
