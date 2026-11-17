import { useMutation, useQueryClient } from '@tanstack/react-query';

import { invalidateSubscriptionData } from '@/hooks/useSubscriptions';
import { request } from '@/lib/request';

// 꾸준히 쓰는 구독 토글 (M-03). 켜면 점검 알림·홈 점검 유도에서 빠짐
export const useSetSteadySubscription = (id: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (isSteady: boolean) =>
      request(`/api/v1/subscriptions/${id}/steady`, { method: 'PATCH', body: { isSteady } }),
    onSettled: () => invalidateSubscriptionData(client),
  });
};
