import { http } from 'msw';

import { ok } from '../response.ts';

const connected = { status: 'CONNECTED', connected: true, email: 'user@gmail.com' };

export const gmailHandlers = [
  http.get('/api/v1/gmail/connection', () => ok('Gmail 연동 상태를 조회했습니다.', connected)),
  http.post('/api/v1/gmail/connection', () => ok('Gmail을 연동했습니다.', connected, 201)),
  http.delete('/api/v1/gmail/connection', () => ok('Gmail 연동을 해제했습니다.')),
  http.post('/api/v1/gmail/analyses', () =>
    ok('결제 메일을 분석했습니다.', {
      candidates: [
        {
          serviceId: '5e1c9a07-5a4d-4e7b-9c21-000000000003',
          serviceName: '넷플릭스',
          logoUrl: 'https://cdn.gudogging.app/logos/netflix.png',
          category: 'VIDEO_OTT',
          amount: 13500,
          billingCycleValue: 1,
          billingCycleUnit: 'MONTH',
          nextBillingDate: '2026-12-01',
          paymentMethod: 'APP_STORE',
          needsReview: false,
        },
      ],
    }),
  ),
];
