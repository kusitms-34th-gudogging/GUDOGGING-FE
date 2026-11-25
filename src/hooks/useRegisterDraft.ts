import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { FoundSubscription, PaymentInfo, Service } from '@/constants/services';
import { useServices } from '@/hooks/useServices';
import { startOfToday } from '@/utils/date';

type FoundSource = 'SCREENSHOT' | 'GMAIL';
// 직접 등록 중 마지막으로 머문 화면 (서버 임시저장 lastStep, 불러오기로 그 화면에 복원)
// SELECT_SERVICES A-02 · CONFIRM_SUBSCRIPTIONS A-04 · INPUT_SUBSCRIPTION A-03·A-03s
export type RegisterStep = 'SELECT_SERVICES' | 'CONFIRM_SUBSCRIPTIONS' | 'INPUT_SUBSCRIPTION';

interface RegisterDraft {
  selectedIds: string[];
  payments: Record<string, PaymentInfo>;
  // 스크린샷·Gmail 분석으로 불러온 구독과 그 출처 (등록 요청의 source)
  found: FoundSubscription[];
  foundSource?: FoundSource;
  foundChecked?: string[];
  // 직접 등록 A-04 등록 가능에서 체크를 푼 구독. 입력을 마치면 체크된 채로 들어가게 푼 것만 둠 (A-09와 같은 선택 로직)
  // 서버 임시저장엔 없어 기기에만. 서버에서 불러오면 다시 전부 체크 (불러온 구독 체크와 같은 수준)
  unchecked: string[];
  lastStep?: RegisterStep;
  // INPUT_SUBSCRIPTION일 때 입력 중이던 항목 id (사전 등록 serviceId 또는 직접 입력 custom-…). 없으면 새 직접 입력
  editingId?: string;
  setLastStep: (step: RegisterStep, editingId?: string) => void;
  // 서버 임시저장으로 채움 (다른 기기에서 등록하던 걸 불러올 때)
  restore: (
    draft: Pick<RegisterDraft, 'selectedIds' | 'payments' | 'lastStep' | 'editingId'>,
  ) => void;
  // 분석 결과를 받으면 등록 가능 항목을 처음부터 전부 체크 (기획 답변)
  setFound: (source: FoundSource, found: FoundSubscription[]) => void;
  setSelectedIds: (ids: string[]) => void;
  setPayment: (serviceId: string, info: PaymentInfo) => void;
  setFoundChecked: (ids: string[]) => void;
  // 불러온 구독 확인에서 더 고른 구독: 결제 정보를 넣으면 등록 가능에 체크된 채로 보이게
  addFoundChecked: (ids: string[]) => void;
  setUnchecked: (ids: string[]) => void;
  reset: () => void;
}

const EMPTY = {
  selectedIds: [],
  payments: {},
  found: [],
  foundSource: undefined,
  foundChecked: undefined,
  unchecked: [],
  lastStep: undefined,
  editingId: undefined,
};

export const useRegisterDraft = create<RegisterDraft>()(
  persist(
    (set) => ({
      ...EMPTY,
      setSelectedIds: (selectedIds) => set({ selectedIds }),
      setPayment: (id, info) => set((s) => ({ payments: { ...s.payments, [id]: info } })),
      setFound: (foundSource, found) =>
        set({ foundSource, found, foundChecked: found.map((f) => f.id) }),
      setFoundChecked: (foundChecked) => set({ foundChecked }),
      addFoundChecked: (ids) =>
        set((s) => ({ foundChecked: [...new Set([...(s.foundChecked ?? []), ...ids])] })),
      setUnchecked: (unchecked) => set({ unchecked }),
      setLastStep: (lastStep, editingId) => set({ lastStep, editingId }),
      restore: (draft) => set({ ...EMPTY, ...draft }),
      reset: () => set(EMPTY),
    }),
    {
      name: 'register-draft',
      storage: createJSONStorage(() => AsyncStorage, {
        reviver: (key, value) =>
          key === 'nextDate' && typeof value === 'string' ? new Date(value) : value,
      }),
    },
  ),
);

export const hasRegisterDraft = ({ selectedIds, payments, foundChecked }: RegisterDraft) =>
  selectedIds.length > 0 || Object.keys(payments).length > 0 || !!foundChecked;

// 선택한 사전 등록 서비스 + 직접 입력한 구독 (A-04 목록). 불러온 구독을 수정한 값은 불러온 구독 확인에만 보임
// 추가한 순서 (기능명세서 A-04). 직접 입력은 임시저장 items처럼 사전 등록 서비스 뒤에 만든 순서로
export const useRegisterServices = (serviceIds: string[]) => {
  const payments = useRegisterDraft((s) => s.payments);
  const found = useRegisterDraft((s) => s.found);
  const services = useServices().data ?? [];
  return [
    ...serviceIds.flatMap((id) => services.filter((s) => s.id === id)),
    ...Object.entries(payments)
      .filter(([id]) => id.startsWith('custom-') && !found.some((f) => f.id === id))
      .map(([id, p]): Pick<Service, 'id' | 'name' | 'logoUrl'> => ({ id, name: p.name ?? '' })),
  ];
};

// 분석으로 불러온 구독이 가리키는 사전 등록 서비스 (A-02에서 잠그고, 같은 서비스를 또 추가하지 않게)
// 수정 화면(A-15)에서 이름을 바꿨으면 분석이 잘못 알아본 다른 서비스로 보고 뺌 → A-02에서 그 서비스를 새로 추가 가능
export const getFoundServiceIds = (
  found: FoundSubscription[],
  payments: Record<string, PaymentInfo>,
) =>
  found.flatMap((f) =>
    f.serviceId && (payments[f.id]?.name ?? f.name) === f.name ? [f.serviceId] : [],
  );

// 등록할 수 있는 결제 정보. 다음 결제일이 지났으면(임시저장에서 불러온 날짜 등) 다시 입력해야 해서 없는 것으로 봄
export const readyPayment = (payment?: PaymentInfo) =>
  payment && payment.nextDate >= startOfToday() ? payment : undefined;

// 직접 등록 화면이 보일 때 머문 화면으로 기록 (서버 임시저장 lastStep). step이 없으면 기록 안 함
// persist의 set은 저장 Promise를 돌려줘서 그대로 반환하면 effect 정리 함수 자리에 Promise가 들어감 → 블록으로 감쌈
export const useRegisterStep = (step: RegisterStep | undefined, editingId?: string) =>
  useFocusEffect(
    useCallback(() => {
      if (step) useRegisterDraft.getState().setLastStep(step, editingId);
    }, [step, editingId]),
  );
