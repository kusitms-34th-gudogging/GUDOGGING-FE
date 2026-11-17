import { useMutation, useQueryClient } from '@tanstack/react-query';

import { invalidateSubscriptionData } from '@/hooks/useSubscriptions';
import { request } from '@/lib/request';

// 해지 완료 처리 (X-06). 구독 종료로 바뀌고 점검 알림이 멈춤
export const useCancelSubscription = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => request(`/api/v1/subscriptions/${id}/cancel`, { method: 'PATCH' }),
    onSuccess: () => invalidateSubscriptionData(client),
  });
};
