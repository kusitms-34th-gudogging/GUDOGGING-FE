import { http } from 'msw';

import { ok, SUBSCRIPTION_ID } from '../response.ts';

export const notificationHandlers = [
  http.get('/api/v1/notifications', () =>
    ok('알림 목록을 조회했습니다.', {
      notifications: [
        {
          notificationId: '9a1d3c52-5a4d-4e7b-9c21-000000000001',
          type: 'CHECK_REMINDER',
          title: '넷플릭스 외 2건, 63,400원 결제 예정',
          body: '7일 안에 빠져나갈 구독료를 확인하세요.',
          subscriptionId: SUBSCRIPTION_ID,
          sentAt: '2026-11-16T09:00:00',
          read: false,
        },
      ],
    }),
  ),
  http.patch('/api/v1/notifications/:notificationId/read', () => ok('알림을 읽음 처리했습니다.')),
  http.get('/api/v1/notifications/settings', () =>
    ok('알림 설정을 조회했습니다.', { paymentReminderEnabled: true }),
  ),
  http.patch('/api/v1/notifications/settings', async ({ request }) => {
    const { paymentReminderEnabled } = (await request.json()) as {
      paymentReminderEnabled: boolean;
    };
    return ok('알림 설정을 변경했습니다.', { paymentReminderEnabled });
  }),
  http.post('/api/v1/notifications/tokens', () => ok('푸시 토큰을 등록했습니다.')),
];
