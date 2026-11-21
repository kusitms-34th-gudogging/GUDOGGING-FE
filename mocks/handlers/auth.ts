import { http } from 'msw';

import { db } from '../db.ts';
import { ok } from '../response.ts';

const tokens = {
  accessToken: 'eyJhbGciOiJIUzI1NiJ9...',
  refreshToken: 'eyJhbGciOiJIUzI1NiJ9...',
};

// ponytail: 계정은 하나라 Apple·Google 구분 없이 처음 로그인만 새 가입, 탈퇴하면 다시 처음
const login = () => {
  const isNewUser = !db.registered;
  db.registered = true;
  return ok('로그인되었습니다.', { ...tokens, isNewUser });
};

export const authHandlers = [
  http.post('/api/v1/auth/apple', login),
  http.post('/api/v1/auth/google', login),
  http.post('/api/v1/auth/reissue', () => ok('토큰이 재발급되었습니다.', tokens)),
  http.post('/api/v1/auth/logout', () => ok('로그아웃했습니다.')),
];
