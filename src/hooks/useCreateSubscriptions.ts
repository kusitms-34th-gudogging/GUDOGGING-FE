import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { PaymentInfo } from '@/constants/services';
import { invalidateSubscriptionData } from '@/hooks/useSubscriptions';
import { request } from '@/lib/request';
import { toCategoryCode, toCycleUnitCode, toPaymentMethodCode } from '@/utils/apiCodes';
import { formatDate } from '@/utils/date';

export interface NewSubscription {
  // 사전 등록 서비스 id. 직접 입력은 없음
  serviceId?: string;
  name: string;
  payment: PaymentInfo;
}

// 구독 일괄 등록 (A-04·A-09). 직접 입력·스크린샷·Gmail 공통
export const useCreateSubscriptions = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      source,
      subscriptions,
    }: {
      source: 'MANUAL' | 'SCREENSHOT' | 'GMAIL';
      subscriptions: NewSubscription[];
    }) =>
      request<{ createdCount: number }>('/api/v1/subscriptions', {
        method: 'POST',
        body: {
          source,
          subscriptions: subscriptions.map(({ serviceId, name, payment: p }) => ({
            serviceId: serviceId ?? null,
            serviceName: name,
            // 직접 입력해도 고른 카테고리를 보냄 (명세 확인 요청 중: 직접 입력은 ETC로 보낸다는 설명과 다름)
            category: toCategoryCode(p.category),
            amount: p.amount,
            billingCycleValue: p.cycle,
            billingCycleUnit: toCycleUnitCode(p.unit),
            nextBillingDate: formatDate(p.nextDate),
            paymentMethod: toPaymentMethodCode(p.paidAt),
          })),
        },
      }),
    onSuccess: () => invalidateSubscriptionData(client),
  });
};
