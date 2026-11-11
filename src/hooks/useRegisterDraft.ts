import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { FOUND_SAMPLE, type PaymentInfo, SERVICES } from '@/constants/services';

interface RegisterDraft {
  selectedIds: string[];
  payments: Record<string, PaymentInfo>;
  foundChecked?: string[];
  setSelectedIds: (ids: string[]) => void;
  setPayment: (serviceId: string, info: PaymentInfo) => void;
  setFoundChecked: (ids: string[]) => void;
  // 불러온 구독 확인에서 더 고른 구독: 결제 정보를 넣으면 등록 가능에 체크된 채로 보이게
  addFoundChecked: (ids: string[]) => void;
  reset: () => void;
}

const EMPTY = { selectedIds: [], payments: {}, foundChecked: undefined };

export const useRegisterDraft = create<RegisterDraft>()(
  persist(
    (set) => ({
      ...EMPTY,
      setSelectedIds: (selectedIds) => set({ selectedIds }),
      setPayment: (id, info) => set((s) => ({ payments: { ...s.payments, [id]: info } })),
      setFoundChecked: (foundChecked) => set({ foundChecked }),
      addFoundChecked: (ids) =>
        set((s) => ({ foundChecked: [...new Set([...(s.foundChecked ?? []), ...ids])] })),
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
export const useRegisterServices = (serviceIds: string[]) => {
  const payments = useRegisterDraft((s) => s.payments);
  return [
    ...SERVICES.filter((s) => serviceIds.includes(s.id)),
    ...Object.entries(payments)
      .filter(([id]) => id.startsWith('custom-') && !FOUND_SAMPLE.some((f) => f.id === id))
      .map(([id, p]) => ({ id, name: p.name ?? '' })),
  ];
};

// 분석으로 불러온 구독이 가리키는 사전 등록 서비스 (A-02에서 잠그고, 같은 서비스를 또 추가하지 않게)
// 수정 화면(A-15)에서 이름을 바꿨으면 분석이 잘못 알아본 다른 서비스로 보고 뺌 → A-02에서 그 서비스를 새로 추가 가능
export const getFoundServiceIds = (payments: Record<string, PaymentInfo>) =>
  FOUND_SAMPLE.flatMap((f) =>
    f.serviceId && (payments[f.id]?.name ?? f.name) === f.name ? [f.serviceId] : [],
  );

// 등록 완료(A-05): 넘겨받은 항목만. 저장한 이름(직접 입력·불러온 구독에서 바꾼 이름)이 있으면 그 이름, 없으면 SERVICES 이름
export const getRegisteredServices = (ids: string[], payments: Record<string, PaymentInfo>) =>
  ids.map((id) => ({
    id,
    name: payments[id]?.name ?? SERVICES.find((s) => s.id === id)?.name ?? '',
  }));
