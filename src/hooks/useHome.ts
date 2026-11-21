import { useQuery } from '@tanstack/react-query';

import { request } from '@/lib/request';

interface HomePayment {
  subscriptionId: string;
  serviceName: string;
  logoUrl: string | null;
  amount: number;
  nextBillingDate: string;
  dDay: number;
  // 이번 결제 주기 점검 미완료면 true ('구독 점검' 노출)
  needsCheckup: boolean;
}

export interface Home {
  summary: {
    expectedAmount: number;
    yearlyAmount: number;
    subscriptionCount: number;
    logos: string[];
  };
  // 이번 결제 주기에 아직 점검 안 한 구독 (꾸준히 쓰는 구독 제외), 최대 5개
  upcomingPayments: HomePayment[];
  usage: {
    hasCheckup: boolean;
    nudgeSubscriptionId: string | null;
    unusedCount: number;
    monthlyAmount: number;
    yearlyAmount: number;
    // 최근 점검 활용도 낮은 순, 최대 3개
    items: (Pick<HomePayment, 'subscriptionId' | 'serviceName' | 'logoUrl' | 'amount'> & {
      scorePercent: number;
    })[];
  };
  hasUnreadNotification: boolean;
}

export const homeKeys = {
  all: ['home'] as const,
};

export const useHome = () =>
  useQuery({
    queryKey: homeKeys.all,
    queryFn: ({ signal }) => request<Home>('/api/v1/home', { signal }),
  });
