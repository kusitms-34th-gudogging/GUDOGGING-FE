import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { PaymentInfo } from '@/constants/services';
import { invalidateSubscriptionData } from '@/hooks/useSubscriptions';
import { request } from '@/lib/request';
import { toCategoryCode, toCycleUnitCode, toPaymentMethodCode } from '@/utils/apiCodes';
import { formatDate } from '@/utils/date';

// 구독 정보 수정 (M-03 더보기 > 편집). 구독 중만 수정 가능 (명세)
export const useUpdateSubscription = (id: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (p: PaymentInfo & { name: string }) =>
      request(`/api/v1/subscriptions/${id}`, {
        method: 'PATCH',
        body: {
          serviceName: p.name,
          category: toCategoryCode(p.category),
          amount: p.amount,
          billingCycleValue: p.cycle,
          billingCycleUnit: toCycleUnitCode(p.unit),
          nextBillingDate: formatDate(p.nextDate),
          paymentMethod: toPaymentMethodCode(p.paidAt),
        },
      }),
    onSuccess: () => invalidateSubscriptionData(client),
  });
};
