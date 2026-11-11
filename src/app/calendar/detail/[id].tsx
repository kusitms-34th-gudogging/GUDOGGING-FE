import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { useCalendarPayments } from '@/hooks/useCalendarPayments';
import { CalendarDetailScreen } from '@/screens/calendar/CalendarDetailScreen';

export default function CalendarDetailRoute() {
  const { id, date } = useLocalSearchParams<{ id: string; date?: string }>();
  const found = useCalendarPayments((s) => s.payments.find((p) => p.id === id));
  const remove = useCalendarPayments((s) => s.remove);
  // 삭제 후 화면이 닫히는 동안 빈 화면이 되지 않게 처음 받은 결제를 들고 있음
  const [kept] = useState(found);
  const payment = found ?? kept;
  if (!payment) return null;
  // date=YYYY-MM-DD (캘린더에서 고른 날짜). 없으면 오늘
  const [y, m, d] = (date ?? '').split('-').map(Number);
  const picked = y && m && d ? new Date(y, m - 1, d) : new Date();
  return (
    <CalendarDetailScreen
      payment={payment}
      date={picked}
      onDelete={() => {
        remove(payment.id);
        router.back();
      }}
    />
  );
}
