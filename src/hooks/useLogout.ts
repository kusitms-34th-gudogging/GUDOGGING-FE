import { useMutation, useQueryClient } from '@tanstack/react-query';

import { clearAccountData } from '@/lib/account';
import { request } from '@/lib/request';

// 로그아웃 (E-01). 서버 세션 종료가 실패해도 기기에선 로그아웃 (토큰·계정 데이터·캐시 비움)
export const useLogout = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => request('/api/v1/auth/logout', { method: 'POST' }),
    onSettled: async () => {
      await clearAccountData();
      client.clear();
    },
  });
};
