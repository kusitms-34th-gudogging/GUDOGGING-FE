import { create } from 'zustand';

import { CALENDAR_SAMPLE, type CalendarPayment } from '@/constants/calendar';

interface CalendarPayments {
  payments: CalendarPayment[];
  // C-04 삭제하기: 구독과 점검 기록 삭제
  remove: (id: string) => void;
}

// shortcut: 샘플을 메모리에 두고 앱을 다시 켜면 되살아남, 캘린더·구독 삭제 API 연동 시 API 훅으로 교체
export const useCalendarPayments = create<CalendarPayments>()((set) => ({
  payments: CALENDAR_SAMPLE,
  remove: (id) => set((s) => ({ payments: s.payments.filter((p) => p.id !== id) })),
}));
