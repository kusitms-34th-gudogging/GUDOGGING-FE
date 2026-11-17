import { type QueryClient, useQuery } from '@tanstack/react-query';

import type { SubscriptionDetail } from '@/constants/manage';
import { homeKeys } from '@/hooks/useHome';
import { request } from '@/lib/request';
import {
  type ApiCategory,
  type ApiCycleUnit,
  type ApiPaymentMethod,
  type ApiStage,
  CATEGORY_LABEL,
  CYCLE_UNIT,
  formatStage,
  PAID_AT_OF,
} from '@/utils/apiCodes';
import { parseDate } from '@/utils/date';

export type SubscriptionStatus = 'ACTIVE' | 'ENDED';

interface SubscriptionListResponse {
  count: number;
  activeCount: number;
  endedCount: number;
  monthlyTotal: number;
  subscriptions: {
    subscriptionId: string;
    serviceName: string;
    logoUrl: string | null;
    amount: number;
    billingCycleValue: number;
    billingCycleUnit: ApiCycleUnit;
    nextBillingDate: string | null;
    dDay: number | null;
    canceledAt: string | null;
    totalPaidAmount: number | null;
  }[];
}

interface CheckupAnswers {
  usageAnswer: string;
  satisfactionAnswer: string;
  planAnswer: string;
}

interface SubscriptionDetailResponse {
  subscriptionId: string;
  status: SubscriptionStatus;
  serviceName: string;
  category: ApiCategory;
  amount: number;
  billingCycleValue: number;
  billingCycleUnit: ApiCycleUnit;
  nextBillingDate: string;
  startedAt: string;
  paymentMethod: ApiPaymentMethod;
  isSteady: boolean;
  canceledAt: string | null;
  totalPaidAmount: number;
  latestCheckup:
    | (CheckupAnswers & {
        checkedAt: string;
        stage: ApiStage;
        score: number;
        cancelReasonText: string | null;
      })
    | null;
  pastCheckupAverage:
    | (CheckupAnswers & { periodFrom: string; periodTo: string; stage: ApiStage; score: number })
    | null;
}

export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  list: (status: SubscriptionStatus) => [...subscriptionKeys.all, 'list', { status }] as const,
  detail: (id: string) => [...subscriptionKeys.all, 'detail', id] as const,
};

// 구독을 바꾸면 목록·상세·홈 요약이 모두 달라짐
export const invalidateSubscriptionData = (client: QueryClient) =>
  Promise.all([
    client.invalidateQueries({ queryKey: subscriptionKeys.all }),
    client.invalidateQueries({ queryKey: homeKeys.all }),
  ]);

export const useSubscriptions = (status: SubscriptionStatus) =>
  useQuery({
    queryKey: subscriptionKeys.list(status),
    queryFn: ({ signal }) =>
      request<SubscriptionListResponse>(`/api/v1/subscriptions?status=${status}`, { signal }),
    select: (data) => ({
      ...data,
      subscriptions: data.subscriptions.map((s) => ({
        id: s.subscriptionId,
        name: s.serviceName,
        amount: s.amount,
        cycle: s.billingCycleValue,
        unit: CYCLE_UNIT[s.billingCycleUnit],
        nextDate: s.nextBillingDate ? parseDate(s.nextBillingDate) : undefined,
        dDay: s.dDay,
        cancelledAt: s.canceledAt ? parseDate(s.canceledAt) : undefined,
        totalSpent: s.totalPaidAmount,
      })),
    }),
  });

const monthOf = (date: string) => parseDate(date).getMonth() + 1;
// 예: 3월~6월 결과 (한 달이면 6월 결과)
const periodLabel = (from: string, to: string) =>
  monthOf(from) === monthOf(to)
    ? `${monthOf(to)}월 결과`
    : `${monthOf(from)}월~${monthOf(to)}월 결과`;

const toDetail = (s: SubscriptionDetailResponse): SubscriptionDetail => {
  const base = {
    id: s.subscriptionId,
    name: s.serviceName,
    amount: s.amount,
    cycle: s.billingCycleValue,
    unit: CYCLE_UNIT[s.billingCycleUnit],
    nextDate: parseDate(s.nextBillingDate),
    category: CATEGORY_LABEL[s.category],
    paidAt: PAID_AT_OF[s.paymentMethod],
    startedAt: parseDate(s.startedAt),
  };
  const answers = (c: CheckupAnswers) => ({
    usage: c.usageAnswer,
    satisfaction: c.satisfactionAnswer,
    plan: c.planAnswer,
  });
  if (s.status === 'ENDED') {
    const c = s.latestCheckup;
    return {
      ...base,
      status: 'ended',
      cancelledAt: parseDate(s.canceledAt!),
      totalSpent: s.totalPaidAmount,
      // shortcut: 해지 이유 코드(cancelReasons)는 카테고리별 문구라 직접 입력한 이유만 표시, 코드 문구 정해지면 같이
      lastCheckup: c
        ? {
            checkedAt: parseDate(c.checkedAt),
            result: formatStage(c.stage, c.score),
            ...answers(c),
            cancelReason: c.cancelReasonText ?? undefined,
          }
        : undefined,
    };
  }
  const avg = s.pastCheckupAverage;
  return {
    ...base,
    status: 'active',
    steady: s.isSteady,
    lastCheckup: avg
      ? {
          period: periodLabel(avg.periodFrom, avg.periodTo),
          result: formatStage(avg.stage, avg.score),
          ...answers(avg),
        }
      : undefined,
  };
};

export const useSubscription = (id: string) =>
  useQuery({
    queryKey: subscriptionKeys.detail(id),
    queryFn: ({ signal }) =>
      request<SubscriptionDetailResponse>(`/api/v1/subscriptions/${id}`, { signal }),
    select: toDetail,
  });
