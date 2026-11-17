import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import type { PaymentInfo, Service } from '@/constants/services';
import { useDeleteSubscriptionDraft } from '@/hooks/useDeleteSubscriptionDraft';
import { type RegisterStep, useRegisterDraft } from '@/hooks/useRegisterDraft';
import { useSaveSubscriptionDraft } from '@/hooks/useSaveSubscriptionDraft';
import { useServices } from '@/hooks/useServices';
import { request } from '@/lib/request';
import {
  type ApiCategory,
  type ApiCycleUnit,
  type ApiPaymentMethod,
  CATEGORY_LABEL,
  CYCLE_UNIT,
  PAID_AT_OF,
  toCategoryCode,
  toCycleUnitCode,
  toPaymentMethodCode,
} from '@/utils/apiCodes';
import { formatDate, parseDate } from '@/utils/date';

// 서버 임시저장 항목. 미입력 값은 null (명세)
export interface DraftItem {
  serviceId: string | null;
  serviceName: string;
  category: ApiCategory | null;
  amount: number | null;
  billingCycleValue: number | null;
  billingCycleUnit: ApiCycleUnit | null;
  nextBillingDate: string | null;
  paymentMethod: ApiPaymentMethod | null;
}

export interface SubscriptionDraft {
  savedAt: string;
  lastStep: RegisterStep;
  items: DraftItem[];
}

export const draftKeys = {
  all: ['subscriptionDraft'] as const,
};

// 사용자당 1건, 없으면 null
export const useSubscriptionDraft = () =>
  useQuery({
    queryKey: draftKeys.all,
    queryFn: ({ signal }) =>
      request<SubscriptionDraft | null>('/api/v1/subscriptions/drafts', { signal }),
  });

type ManualDraft = Pick<
  ReturnType<typeof useRegisterDraft.getState>,
  'selectedIds' | 'payments' | 'found'
>;

const paymentFields = (p?: PaymentInfo) => ({
  amount: p?.amount ?? null,
  billingCycleValue: p?.cycle ?? null,
  billingCycleUnit: p ? toCycleUnitCode(p.unit) : null,
  nextBillingDate: p ? formatDate(p.nextDate) : null,
  paymentMethod: p ? toPaymentMethodCode(p.paidAt) : null,
});

// 직접 등록(A-02~A-04)의 고른 서비스 + 직접 입력. 분석으로 불러온 구독은 명세 임시저장에 없어 기기에만 둠
export const toDraftItems = (
  { selectedIds, payments, found }: ManualDraft,
  services: Service[],
): DraftItem[] => [
  ...selectedIds.map((id) => {
    const service = services.find((s) => s.id === id);
    const p = payments[id];
    return {
      serviceId: id,
      serviceName: service?.name ?? '',
      category: toCategoryCode(p?.category ?? service?.category),
      ...paymentFields(p),
    };
  }),
  ...Object.entries(payments)
    .filter(([id]) => id.startsWith('custom-') && !found.some((f) => f.id === id))
    .map(([, p]) => ({
      serviceId: null,
      serviceName: p.name ?? '',
      category: toCategoryCode(p.category),
      ...paymentFields(p),
    })),
];

// 서버 임시저장 → 기기 저장소. 결제 정보를 다 채운 항목만 결제 정보로 (A-03은 일부만 저장하지 않음)
export const fromDraft = ({ items, lastStep }: SubscriptionDraft) => {
  const payments: Record<string, PaymentInfo> = {};
  items.forEach((item, i) => {
    const { amount, billingCycleValue, billingCycleUnit, nextBillingDate, paymentMethod } = item;
    if (!amount || !billingCycleValue || !billingCycleUnit || !nextBillingDate || !paymentMethod)
      return;
    payments[item.serviceId ?? `custom-draft-${i}`] = {
      // 직접 입력은 이름을 결제 정보에 같이 둠 (useRegisterServices 기준)
      name: item.serviceId ? undefined : item.serviceName,
      category: CATEGORY_LABEL[item.category ?? 'ETC'],
      amount,
      cycle: billingCycleValue,
      unit: CYCLE_UNIT[billingCycleUnit],
      nextDate: parseDate(nextBillingDate),
      paidAt: PAID_AT_OF[paymentMethod],
    };
  });
  return {
    selectedIds: items.flatMap((item) => (item.serviceId ? [item.serviceId] : [])),
    payments,
    lastStep,
  };
};

// 직접 등록 중 고른 서비스·입력한 결제 정보·머문 화면이 바뀔 때마다 서버에 임시저장 (명세: 입력값이 바뀔 때마다 앱이 보냄)
// 다 비면(나가기·새로 등록하기·등록 완료) 서버 임시저장도 삭제. 등록 구간(register/_layout)에서만 동작
export const useSyncSubscriptionDraft = () => {
  const services = useServices().data;
  const save = useSaveSubscriptionDraft();
  const remove = useDeleteSubscriptionDraft();
  const { mutate: saveDraft } = save;
  const { mutate: deleteDraft } = remove;

  useEffect(() => {
    if (!services) return;
    const snapshot = () => {
      const state = useRegisterDraft.getState();
      return { items: toDraftItems(state, services), lastStep: state.lastStep };
    };
    let prev = JSON.stringify(snapshot());
    return useRegisterDraft.subscribe(() => {
      const next = snapshot();
      const key = JSON.stringify(next);
      if (key === prev) return;
      const hadItems = JSON.parse(prev).items.length > 0;
      prev = key;
      if (next.items.length > 0)
        saveDraft({ items: next.items, lastStep: next.lastStep ?? 'A-02' });
      else if (hadItems) deleteDraft();
    });
  }, [services, saveDraft, deleteDraft]);
};
