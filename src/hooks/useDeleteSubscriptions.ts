import { useMutation, useQueryClient } from '@tanstack/react-query';

import { invalidateSubscriptionData } from '@/hooks/useSubscriptions';
import { request } from '@/lib/request';

// 구독 관리 목록 선택 삭제 (M-02.3). 하나라도 실패하면 전체 실패
export const useDeleteSubscriptions = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (subscriptionIds: string[]) =>
      request<{ deletedCount: number }>('/api/v1/subscriptions', {
        method: 'DELETE',
        body: { subscriptionIds },
      }),
    onSuccess: () => invalidateSubscriptionData(client),
  });
};
