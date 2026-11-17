import { useQuery } from '@tanstack/react-query';

import type {
  CheckupQuestion,
  CheckupRecommendation,
  CheckupSubscription,
} from '@/constants/checkup';
import { request } from '@/lib/request';
import { type ApiCategory, CATEGORY_LABEL } from '@/utils/apiCodes';
import { parseDate } from '@/utils/date';

interface CheckupFormResponse {
  category: ApiCategory;
  questions: {
    type: 'USAGE' | 'SATISFACTION' | 'PLAN';
    label: string;
    hint: string | null;
    options: { score: number; text: string }[];
  }[];
  memoPlaceholder: string;
  memoChips: string[];
  serviceName: string;
  amount: number;
  nextBillingDate: string;
  lastMemo: string | null;
}

interface CheckupResultResponse {
  checkupId: string;
  subscriptionId: string;
  serviceName: string;
  nextBillingDate: string;
  score: number;
  bundles: {
    name: string;
    includes: string[];
    tags: string[];
    monthlyPrice: number;
    monthlySaving: number;
    condition: string | null;
    priceType: 'FIXED' | 'MAX';
  }[];
  categorySpending: {
    category: ApiCategory;
    monthlyTotal: number;
    items: { serviceName: string; logoUrl: string | null; monthlyAmount: number }[];
    otherCount: number;
  };
}

// K-80 같은 카테고리 지출 (점검 중인 구독이 맨 위, 5개 넘으면 4개 + 그 외 n개는 서버가 정리)
export interface CategorySpending {
  items: { name: string; monthly: number; current: boolean }[];
  rest: number;
  total: number;
}

export const checkupKeys = {
  all: ['checkups'] as const,
  form: (subscriptionId: string) => [...checkupKeys.all, 'form', subscriptionId] as const,
  result: (checkupId: string) => [...checkupKeys.all, 'result', checkupId] as const,
};

// 점검 문항 화면(K-11~K-70): 구독 정보 + 카테고리별 문항·메모 예시 (서버가 카테고리에 맞춰 줌)
export const useCheckupForm = (subscriptionId: string) =>
  useQuery({
    queryKey: checkupKeys.form(subscriptionId),
    queryFn: ({ signal }) =>
      request<CheckupFormResponse>(`/api/v1/subscriptions/${subscriptionId}/checkups/form`, {
        signal,
      }),
    select: (f) => ({
      subscription: {
        id: subscriptionId,
        name: f.serviceName,
        category: CATEGORY_LABEL[f.category],
        amount: f.amount,
        nextDate: parseDate(f.nextBillingDate),
      } satisfies CheckupSubscription,
      // 이용도 · 만족도 · 다음 달 계획 순. 선택지는 1점(부정)부터
      questions: f.questions.map((q): CheckupQuestion => ({
        title: q.label,
        hint: q.hint ?? '',
        options: q.options.toSorted((a, b) => a.score - b.score).map((o) => o.text),
      })),
      memo: { placeholder: f.memoPlaceholder, chips: f.memoChips },
    }),
  });

export const useCheckupResult = (checkupId: string) =>
  useQuery({
    queryKey: checkupKeys.result(checkupId),
    queryFn: ({ signal }) =>
      request<CheckupResultResponse>(`/api/v1/checkups/${checkupId}`, { signal }),
    select: (r) => ({
      subscription: {
        id: r.subscriptionId,
        name: r.serviceName,
        category: CATEGORY_LABEL[r.categorySpending.category],
        nextDate: parseDate(r.nextBillingDate),
      },
      usage: r.score,
      spending: {
        // 점검 중인 구독이 맨 위로 옴 (명세)
        items: r.categorySpending.items.map((s, i) => ({
          name: s.serviceName,
          monthly: s.monthlyAmount,
          current: i === 0,
        })),
        rest: r.categorySpending.otherCount,
        total: r.categorySpending.monthlyTotal,
      } satisfies CategorySpending,
      recommendations: r.bundles.map((b): CheckupRecommendation => ({
        id: b.name,
        title: b.name,
        subtitle: b.includes.join(' + '),
        tags: [b.tags[0] ?? '', b.tags[1] ?? ''],
        saving: b.monthlySaving,
        upTo: b.priceType === 'MAX',
        // 카드는 'current - saving'을 이용 금액으로 보여 줌 → 번들 가격 + 절약 금액
        current: b.monthlyPrice + b.monthlySaving,
        condition: b.condition ?? undefined,
      })),
    }),
  });
