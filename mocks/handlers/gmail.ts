import { http } from 'msw';

import { db } from '../db.ts';
import { ok } from '../response.ts';

const connection = () => ({
  status: db.gmailEmail ? 'CONNECTED' : 'NOT_CONNECTED',
  connected: !!db.gmailEmail,
  email: db.gmailEmail,
});

export const gmailHandlers = [
  http.get('/api/v1/gmail/connection', () => ok('Gmail 연동 상태를 조회했습니다.', connection())),
  http.post('/api/v1/gmail/connection', () => {
    // shortcut: 인증 코드 검증 없이 항상 연동 성공, 실패 흐름은 개발 서버로 확인
    db.gmailEmail = 'user@gmail.com';
    return ok('Gmail을 연동했습니다.', connection(), 201);
  }),
  http.delete('/api/v1/gmail/connection', () => {
    db.gmailEmail = null;
    return ok('Gmail 연동을 해제했습니다.');
  }),
  http.post('/api/v1/gmail/analyses', () =>
    ok('결제 메일을 분석했습니다.', {
      // 임의: 명세 mock은 Netflix인데 기본 구독(Netflix)과 겹치지 않게 Spotify로
      candidates: [
        {
          serviceId: '5e1c9a07-5a4d-4e7b-9c21-000000000004',
          serviceName: 'Spotify',
          logoUrl: 'https://cdn.gudogging.com/logos/4.png',
          category: 'MUSIC',
          amount: 10900,
          billingCycleValue: 1,
          billingCycleUnit: 'MONTH',
          nextBillingDate: '2026-12-01',
          paymentMethod: 'APP_STORE',
          needsReview: false,
          reviewFields: [],
        },
      ],
    }),
  ),
];
