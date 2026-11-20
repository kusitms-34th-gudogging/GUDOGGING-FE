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
  // INPUT_SUBSCRIPTION일 때 입력 중이던 items 순번, null이면 새 직접 입력 (다른 단계는 항상 null)
  editingItemIndex: number | null;
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

// 결제 정보 6개는 모두 null(미입력)이거나 모두 입력 (명세)
const paymentFields = (p?: PaymentInfo) => ({
  amount: p?.amount ?? null,
  billingCycleValue: p?.cycle ?? null,
  billingCycleUnit: p ? toCycleUnitCode(p.unit) : null,
  nextBillingDate: p ? formatDate(p.nextDate) : null,
  paymentMethod: p ? toPaymentMethodCode(p.paidAt) : null,
});

// 직접 등록(A-02~A-04)의 고른 서비스 + 직접 입력, [기기 id, 임시저장 항목]. 분석으로 불러온 구독은 명세 임시저장에 없어 기기에만 둠
const draftEntries = (
  { selectedIds, payments, found }: ManualDraft,
  services: Service[],
): [string, DraftItem][] => [
  ...selectedIds.map((id): [string, DraftItem] => {
    const service = services.find((s) => s.id === id);
    const p = payments[id];
    return [
      id,
      {
        serviceId: id,
        serviceName: service?.name ?? '',
        category: p ? toCategoryCode(p.category ?? service?.category) : null,
        ...paymentFields(p),
      },
    ];
  }),
  ...Object.entries(payments)
    .filter(([id]) => id.startsWith('custom-') && !found.some((f) => f.id === id))
    .map(([id, p]): [string, DraftItem] => [
      id,
      {
        serviceId: null,
        serviceName: p.name ?? '',
        category: toCategoryCode(p.category),
        ...paymentFields(p),
      },
    ]),
];

// 머문 화면 → 명세 lastStep·editingItemIndex. 입력 중인 항목이 임시저장에 없으면 그 목록 화면(A-04)으로
export const toDraftStep = (
  lastStep: RegisterStep | undefined,
  editingId: string | undefined,
  ids: string[],
) => {
  if (lastStep !== 'INPUT_SUBSCRIPTION')
    return { lastStep: lastStep ?? 'SELECT_SERVICES', editingItemIndex: null };
  if (editingId === undefined) return { lastStep, editingItemIndex: null };
  const index = ids.indexOf(editingId);
  return index >= 0
    ? { lastStep, editingItemIndex: index }
    : { lastStep: 'CONFIRM_SUBSCRIPTIONS' as const, editingItemIndex: null };
};

// 서버 임시저장 → 기기 저장소. 결제 정보를 다 채운 항목만 결제 정보로 (A-03은 일부만 저장하지 않음)
export const fromDraft = ({ items, lastStep, editingItemIndex }: SubscriptionDraft) => {
  const payments: Record<string, PaymentInfo> = {};
  const ids = items.map((item, i) => item.serviceId ?? `custom-draft-${i}`);
  items.forEach((item, i) => {
    const { amount, billingCycleValue, billingCycleUnit, nextBillingDate, paymentMethod } = item;
    if (!amount || !billingCycleValue || !billingCycleUnit || !nextBillingDate || !paymentMethod)
      return;
    payments[ids[i]] = {
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
    editingId: editingItemIndex === null ? undefined : ids[editingItemIndex],
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
      const entries = draftEntries(state, services);
      return {
        items: entries.map(([, item]) => item),
        ...toDraftStep(
          state.lastStep,
          state.editingId,
          entries.map(([id]) => id),
        ),
      };
    };
    let prev = JSON.stringify(snapshot());
    return useRegisterDraft.subscribe(() => {
      const next = snapshot();
      const key = JSON.stringify(next);
      if (key === prev) return;
      const hadItems = JSON.parse(prev).items.length > 0;
      prev = key;
      if (next.items.length > 0) saveDraft(next);
      else if (hadItems) deleteDraft();
    });
  }, [services, saveDraft, deleteDraft]);
};
