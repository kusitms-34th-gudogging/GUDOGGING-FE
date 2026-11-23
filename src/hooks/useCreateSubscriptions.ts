import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { PaymentInfo } from '@/constants/services';
import { invalidateSubscriptionData } from '@/hooks/useSubscriptions';
import { track } from '@/lib/analytics';
import { request } from '@/lib/request';
import {
  type ApiCycleUnit,
  type ApiPaymentMethod,
  toCategoryCode,
  toCycleUnitCode,
  toPaymentMethodCode,
} from '@/utils/apiCodes';
import { formatDate } from '@/utils/date';

export interface NewSubscription {
  // 사전 등록 서비스 id. 직접 입력은 없음
  serviceId?: string;
  name: string;
  payment: PaymentInfo;
}

// 등록 응답. 방금 등록한 구독을 요청 순서대로 (등록 완료 A-05가 그림)
export interface CreatedSubscriptions {
  createdCount: number;
  subscriptions: {
    subscriptionId: string;
    serviceName: string;
    logoUrl: string | null;
    amount: number;
    billingCycleValue: number;
    billingCycleUnit: ApiCycleUnit;
    nextBillingDate: string;
    paymentMethod: ApiPaymentMethod;
  }[];
}

// 등록 완료 화면이 마지막 등록 결과를 useMutationState로 찾는 키
export const createSubscriptionsKey = ['subscriptions', 'create'] as const;

// 구독 일괄 등록 (A-04·A-09). 직접 입력·스크린샷·Gmail 공통
export const useCreateSubscriptions = () => {
  const client = useQueryClient();
  return useMutation({
    mutationKey: createSubscriptionsKey,
    mutationFn: ({
      source,
      subscriptions,
    }: {
      source: 'MANUAL' | 'SCREENSHOT' | 'GMAIL';
      subscriptions: NewSubscription[];
    }) =>
      request<CreatedSubscriptions>('/api/v1/subscriptions', {
        method: 'POST',
        body: {
          source,
          subscriptions: subscriptions.map(({ serviceId, name, payment: p }) => ({
            serviceId: serviceId ?? null,
            serviceName: name,
            // 직접 입력은 입력 화면 기본값이 기타(ETC)이고, 고르면 고른 카테고리 (명세: 앱이 기본값 ETC로 보냄)
            category: toCategoryCode(p.category),
            amount: p.amount,
            billingCycleValue: p.cycle,
            billingCycleUnit: toCycleUnitCode(p.unit),
            nextBillingDate: formatDate(p.nextDate),
            paymentMethod: toPaymentMethodCode(p.paidAt),
          })),
        },
      }),
    onSuccess: ({ createdCount }, { source }) => {
      track('reg_complete', {
        method: source === 'MANUAL' ? 'manual' : source === 'SCREENSHOT' ? 'screenshot' : 'gmail',
        registered_count: createdCount,
      });
      return invalidateSubscriptionData(client);
    },
  });
};
