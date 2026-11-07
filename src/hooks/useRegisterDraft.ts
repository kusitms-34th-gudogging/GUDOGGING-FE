import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { type PaymentInfo, SERVICES } from '@/constants/services';

interface RegisterDraft {
  selectedIds: string[];
  payments: Record<string, PaymentInfo>;
  foundChecked?: string[];
  setSelectedIds: (ids: string[]) => void;
  setPayment: (serviceId: string, info: PaymentInfo) => void;
  setFoundChecked: (ids: string[]) => void;
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

// 선택한 사전 등록 서비스 + 직접 입력한 구독 (A-04 목록)
export const useRegisterServices = (serviceIds: string[]) => {
  const payments = useRegisterDraft((s) => s.payments);
  return [
    ...SERVICES.filter((s) => serviceIds.includes(s.id)),
    ...Object.entries(payments)
      .filter(([id]) => id.startsWith('custom-'))
      .map(([id, p]) => ({ id, name: p.name ?? '' })),
  ];
};

// 등록 완료(A-05): 넘겨받은 항목만. 사전 등록 서비스는 SERVICES 이름, 직접 입력은 저장한 이름
export const getRegisteredServices = (ids: string[], payments: Record<string, PaymentInfo>) =>
  ids.map((id) => ({
    id,
    name: SERVICES.find((s) => s.id === id)?.name ?? payments[id]?.name ?? '',
  }));
