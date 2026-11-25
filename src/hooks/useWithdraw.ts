import { useMutation, useQueryClient } from '@tanstack/react-query';

import { clearAccountData } from '@/lib/account';
import { request } from '@/lib/request';

// 회원 탈퇴 (E-9). 실패하면 서버가 전부 롤백해 같은 요청으로 다시 시도 (E-10)
export const useWithdraw = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => request('/api/v1/users/me', { method: 'DELETE' }),
    // 기본값(online)은 오프라인이면 요청을 멈춰 뒀다가 재연결 때 자동으로 보냄 → 바로 실패시켜 E-10을 띄우고 '다시 시도하기'로만 재요청
    networkMode: 'always',
    // 탈퇴가 끝난 뒤에만 기기에 남은 계정 데이터와 서버 데이터 캐시를 비움
    onSuccess: () => {
      clearAccountData();
      client.clear();
    },
  });
};
