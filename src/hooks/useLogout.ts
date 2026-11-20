import { useMutation, useQueryClient } from '@tanstack/react-query';

import { clearAccountData } from '@/lib/account';
import { authToken } from '@/lib/authToken';
import { request } from '@/lib/request';

// 로그아웃 (E-01). 서버 세션 종료가 실패해도 기기에선 로그아웃 (토큰·계정 데이터·캐시 비움)
export const useLogout = () => {
  const client = useQueryClient();
  return useMutation({
    // 서버가 이 리프레시 토큰을 무효화함 (액세스 토큰은 onSettled에서 기기에서만 지움)
    mutationFn: async () =>
      request('/api/v1/auth/logout', {
        method: 'POST',
        body: { refreshToken: await authToken.getRefresh() },
      }),
    onSettled: async () => {
      await clearAccountData();
      client.clear();
    },
  });
};
