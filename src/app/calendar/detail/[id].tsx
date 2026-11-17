import { useLocalSearchParams } from 'expo-router';

import { CalendarDetailScreen } from '@/screens/calendar/CalendarDetailScreen';
import { parseDate } from '@/utils/date';

export default function CalendarDetailRoute() {
  // date=yyyy-MM-dd (캘린더에서 고른 날짜). 없으면 오늘
  const { id, date } = useLocalSearchParams<{ id: string; date?: string }>();
  return <CalendarDetailScreen id={id} date={date ? parseDate(date) : new Date()} />;
}
