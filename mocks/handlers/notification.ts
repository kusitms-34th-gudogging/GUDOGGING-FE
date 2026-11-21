import { http } from 'msw';

import { db } from '../db.ts';
import { ok } from '../response.ts';

// 서버가 푸시를 보내며 쌓는 데이터라 앱이 만들 수 없어 고정 (읽음 여부만 저장)
export const notifications = [
  {
    notificationId: '9a1d3c52-5a4d-4e7b-9c21-000000000001',
    type: 'CHECK_REMINDER',
    title: '넷플릭스 외 2건, 63,400원 결제 예정',
    body: '7일 안에 빠져나갈 구독료를 확인하세요.',
    subscriptionId: '3f2b8c1e-5a4d-4e7b-9c21-000000000001',
    logoUrl: 'https://cdn.gudogging.com/logos/netflix.png',
    sentAt: '2026-11-16T09:00:00',
  },
];

// 구독을 삭제하면 그 구독의 알림도 사라짐 (명세: 구독 선택 삭제)
export const visibleNotifications = () =>
  notifications.filter((n) => db.subscriptions.some((s) => s.subscriptionId === n.subscriptionId));

export const notificationHandlers = [
  http.get('/api/v1/notifications', () =>
    ok('알림 목록을 조회했습니다.', {
      notifications: visibleNotifications().map((n) => ({
        ...n,
        read: db.readNotificationIds.has(n.notificationId),
      })),
    }),
  ),
  http.patch('/api/v1/notifications/:notificationId/read', ({ params }) => {
    db.readNotificationIds.add(params.notificationId as string);
    return ok('알림을 읽음 처리했습니다.');
  }),
  http.get('/api/v1/notifications/settings', () =>
    ok('알림 설정을 조회했습니다.', { paymentReminderEnabled: db.paymentReminderEnabled }),
  ),
  http.patch('/api/v1/notifications/settings', async ({ request }) => {
    db.paymentReminderEnabled = (
      (await request.json()) as { paymentReminderEnabled: boolean }
    ).paymentReminderEnabled;
    return ok('알림 설정을 변경했습니다.', { paymentReminderEnabled: db.paymentReminderEnabled });
  }),
  http.post('/api/v1/notifications/tokens', () => ok('푸시 토큰을 등록했습니다.')),
];
