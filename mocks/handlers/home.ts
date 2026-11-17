import { http } from 'msw';

import { ok, SUBSCRIPTION_ID } from '../response.ts';

export const homeHandlers = [
  http.get('/api/v1/home', () =>
    ok('홈 정보를 조회했습니다.', {
      summary: {
        expectedAmount: 13500,
        yearlyAmount: 162000,
        subscriptionCount: 1,
        logos: ['https://.../netflix.png'],
      },
      upcomingPayments: [
        {
          subscriptionId: SUBSCRIPTION_ID,
          serviceName: '넷플릭스',
          logoUrl: 'https://.../netflix.png',
          amount: 13500,
          nextBillingDate: '2026-11-05',
          dDay: 1,
          needsCheckup: true,
        },
      ],
      hasUnreadNotification: true,
      nearestPayment: null,
      usage: {
        hasCheckup: false,
        nudgeSubscriptionId: SUBSCRIPTION_ID,
        unusedCount: 0,
        monthlyAmount: 0,
        yearlyAmount: 0,
        items: [],
      },
    }),
  ),
];
