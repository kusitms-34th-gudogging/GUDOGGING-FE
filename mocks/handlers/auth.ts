import { http } from 'msw';

import { ok } from '../response.ts';

const tokens = {
  accessToken: 'eyJhbGciOiJIUzI1NiJ9...',
  refreshToken: 'eyJhbGciOiJIUzI1NiJ9...',
};

export const authHandlers = [
  http.post('/api/v1/auth/apple', () => ok('로그인했습니다.', { ...tokens, isNewUser: true })),
  http.post('/api/v1/auth/google', () => ok('로그인했습니다.', { ...tokens, isNewUser: true })),
  http.post('/api/v1/auth/reissue', () => ok('토큰을 재발급했습니다.', tokens)),
  http.post('/api/v1/auth/logout', () => ok('로그아웃했습니다.')),
];
