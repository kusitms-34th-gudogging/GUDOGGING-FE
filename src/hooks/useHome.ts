import { useQuery } from '@tanstack/react-query';

import { request } from '@/lib/request';

interface HomePayment {
  subscriptionId: string;
  serviceName: string;
  logoUrl: string | null;
  amount: number;
  nextBillingDate: string;
  dDay: number;
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
    items: Omit<HomePayment, 'dDay'>[];
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
