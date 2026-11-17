import { http } from 'msw';

import { ok, SUBSCRIPTION_ID } from '../response.ts';

export const calendarHandlers = [
  http.get('/api/v1/calendar', () =>
    ok('월별 결제 일정을 조회했습니다.', {
      monthlyTotal: 13500,
      currentMonthTotal: 13500,
      paymentCount: 1,
      days: [
        {
          date: '2026-12-01',
          totalAmount: 13500,
          payments: [
            {
              subscriptionId: SUBSCRIPTION_ID,
              serviceName: '넷플릭스',
              logoUrl: 'https://.../netflix.png',
              amount: 13500,
              billingCycleValue: 1,
              billingCycleUnit: 'MONTH',
              paymentMethod: 'APP_STORE',
            },
          ],
        },
      ],
    }),
  ),
];
