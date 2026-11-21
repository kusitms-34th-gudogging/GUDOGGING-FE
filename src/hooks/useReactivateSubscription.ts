import { useMutation, useQueryClient } from '@tanstack/react-query';

import { invalidateSubscriptionData } from '@/hooks/useSubscriptions';
import { type SubscriptionInput, toSubscriptionBody } from '@/hooks/useUpdateSubscription';
import { request } from '@/lib/request';

// 지난 구독 재등록 (M-05). 입력한 구독 정보로 덮어쓰고 같은 구독이 구독 중이 됨, 점검 기록은 유지 (명세)
export const useReactivateSubscription = (id: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (p: SubscriptionInput) =>
      request(`/api/v1/subscriptions/${id}/reactivate`, {
        method: 'PATCH',
        body: toSubscriptionBody(p),
      }),
    onSuccess: () => invalidateSubscriptionData(client),
  });
};
