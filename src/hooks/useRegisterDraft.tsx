import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

import type { PaymentInfo } from '@/constants/services';

// 등록 플로우 안에서만 쓰는 입력값 (서비스 id → 결제 정보). register/_layout이 언마운트되면 사라짐
// shortcut: 앱을 나갔다 오면 사라짐, 이어서 등록하기(불러오기 팝업) 작업 시 persist 스토어로 교체
interface RegisterDraft {
  payments: Record<string, PaymentInfo>;
  setPayment: (serviceId: string, info: PaymentInfo) => void;
}

const RegisterDraftContext = createContext<RegisterDraft | null>(null);

export const RegisterDraftProvider = ({ children }: { children: ReactNode }) => {
  const [payments, setPayments] = useState<Record<string, PaymentInfo>>({});
  const value = useMemo(
    () => ({
      payments,
      setPayment: (id: string, info: PaymentInfo) => setPayments((p) => ({ ...p, [id]: info })),
    }),
    [payments],
  );
  return <RegisterDraftContext.Provider value={value}>{children}</RegisterDraftContext.Provider>;
};

export const useRegisterDraft = () => {
  const ctx = useContext(RegisterDraftContext);
  if (!ctx) throw new Error('useRegisterDraft는 RegisterDraftProvider 안에서만 쓸 수 있어요');
  return ctx;
};
