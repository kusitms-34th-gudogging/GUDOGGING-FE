import { http } from 'msw';

import { db } from '../db.ts';
import { ok } from '../response.ts';

export const userHandlers = [
  http.get('/api/v1/users/me', () =>
    ok('내 정보를 조회했습니다.', {
      userId: '7c9e6679-5a4d-4e7b-9c21-000000000001',
      provider: 'GOOGLE',
      email: 'user@gmail.com',
      gmailLinked: !!db.gmailEmail,
      gmailEmail: db.gmailEmail,
    }),
  ),
  // ponytail: 계정은 하나라 탈퇴하면 저장소만 비움
  http.delete('/api/v1/users/me', () => {
    Object.assign(db, {
      subscriptions: [],
      checkups: [],
      draft: null,
      gmailEmail: null,
      readNotificationIds: new Set(),
    });
    return ok('회원 탈퇴했습니다.');
  }),
];
