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
  // 구독 종료된 구독의 점검이면 null
  nextBillingDate: string | null;
  score: number;
  // 금액·막대는 BENEFIT(통신 요금제)면 null, monthlyPrice는 MAX(카드)면 null
  bundles: {
    name: string;
    includes: string;
    tags: string[];
    priceType: 'FIXED' | 'MAX' | 'BENEFIT' | 'EXCLUDED';
    monthlySaving: number | null;
    savingRate: number | null;
    monthlyPrice: number | null;
  }[];
  categorySpending: {
    category: ApiCategory;
    monthlyTotal: number;
    items: { serviceName: string; logoUrl: string | null; monthlyAmount: number }[];
  };
}

// K-80 같은 카테고리 지출 (점검 중인 구독이 맨 위, '그 외 n개'로 줄이지 않고 전부 나열)
export interface CategorySpending {
  items: { name: string; logoUrl?: string; monthly: number; current: boolean }[];
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
        // toSorted(ES2023)는 앱 JS 엔진(Hermes)에서 없을 수 있어 복사 후 sort
        options: [...q.options].sort((a, b) => a.score - b.score).map((o) => o.text),
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
        // 결과 응답엔 로고가 따로 없어 같은 카테고리 지출 맨 위(점검한 구독)의 로고를 씀
        logoUrl: r.categorySpending.items[0]?.logoUrl ?? undefined,
        category: CATEGORY_LABEL[r.categorySpending.category],
        nextDate: r.nextBillingDate ? parseDate(r.nextBillingDate) : undefined,
      },
      usage: r.score,
      spending: {
        // 점검 중인 구독이 맨 위로 옴 (명세)
        items: r.categorySpending.items.map((s, i) => ({
          name: s.serviceName,
          logoUrl: s.logoUrl ?? undefined,
          monthly: s.monthlyAmount,
          current: i === 0,
        })),
        total: r.categorySpending.monthlyTotal,
      } satisfies CategorySpending,
      // EXCLUDED는 명세 설명에 없는 값이라 숨김
      recommendations: r.bundles.flatMap((b): CheckupRecommendation[] =>
        b.priceType === 'EXCLUDED'
          ? []
          : [
              {
                id: b.name,
                title: b.name,
                subtitle: b.includes,
                tags: [b.tags[0] ?? '', b.tags[1] ?? ''],
                priceType: b.priceType,
                saving: b.monthlySaving,
                rate: b.savingRate,
                price: b.monthlyPrice,
              },
            ],
      ),
    }),
  });
