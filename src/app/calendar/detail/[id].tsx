import { useLocalSearchParams } from 'expo-router';

import { CALENDAR_SAMPLE } from '@/constants/calendar';
import { CalendarDetailScreen } from '@/screens/calendar/CalendarDetailScreen';

export default function CalendarDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // shortcut: 샘플에서 찾음, 캘린더 결제 상세 API 연동 시 훅으로 교체
  const payment = CALENDAR_SAMPLE.find((p) => p.id === id);
  if (!payment) return null;
  return <CalendarDetailScreen payment={payment} />;
}
