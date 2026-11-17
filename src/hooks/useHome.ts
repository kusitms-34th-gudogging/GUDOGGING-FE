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
  upcomingPayments: (HomePayment & { needsCheckup: boolean })[];
  nearestPayment: HomePayment | null;
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
