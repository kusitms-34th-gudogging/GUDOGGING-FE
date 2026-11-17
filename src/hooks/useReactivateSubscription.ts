import { useMutation, useQueryClient } from '@tanstack/react-query';

import { invalidateSubscriptionData } from '@/hooks/useSubscriptions';
import { request } from '@/lib/request';
import { formatDate } from '@/utils/date';

// 지난 구독 재등록 (M-05). 같은 구독이 새 다음 결제일로 구독 중이 되고, 점검 기록은 유지 (명세)
export const useReactivateSubscription = (id: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (nextBillingDate: Date) =>
      request(`/api/v1/subscriptions/${id}/reactivate`, {
        method: 'PATCH',
        body: { nextBillingDate: formatDate(nextBillingDate) },
      }),
    onSuccess: () => invalidateSubscriptionData(client),
  });
};
