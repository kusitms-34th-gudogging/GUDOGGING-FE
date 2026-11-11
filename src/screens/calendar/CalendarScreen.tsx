import { useState } from 'react';
import { View } from 'react-native';

import { CalendarDay, type CalendarDaySubscription } from '@/components/calendar/CalendarDay';
import { CalendarWeekday } from '@/components/calendar/CalendarWeekday';

const LOGO = require('@/assets/images/logo_placeholder.png');

// shortcut: 렌더 확인용 샘플 결제일, 캘린더 API 연동 시 API 훅으로 교체
const SAMPLE: Record<number, CalendarDaySubscription[]> = {
  3: [{ id: 'netflix', name: '넷플릭스', category: 'ott', logo: LOGO }],
  12: [
    { id: 'spotify', name: '스포티파이', category: 'music', logo: LOGO },
    { id: 'chatgpt', name: '챗지피티', category: 'productivity', logo: LOGO },
  ],
  17: [
    { id: 'tving', name: '티빙', category: 'ott', logo: LOGO },
    { id: 'coupang', name: '쿠팡 와우', category: 'shopping', logo: LOGO },
    { id: 'youtube', name: '유튜브 프리미엄', category: 'ott', logo: LOGO },
  ],
};

// 이번 달 1일이 든 주의 일요일부터 6주(42칸)
const monthCells = (base: Date) => {
  const first = new Date(base.getFullYear(), base.getMonth(), 1);
  return Array.from(
    { length: 42 },
    (_, i) => new Date(first.getFullYear(), first.getMonth(), i + 1 - first.getDay()),
  );
};

export const CalendarScreen = () => {
  const now = new Date();
  const [selected, setSelected] = useState<number>();
  const cells = monthCells(now);

  return (
    <View className="pt-safe flex-1 bg-bg-default px-screen-x">
      <CalendarWeekday />
      {Array.from({ length: 6 }, (_, w) => (
        <View key={w} className="flex-row gap-px">
          {cells.slice(w * 7, w * 7 + 7).map((d) => {
            const inMonth = d.getMonth() === now.getMonth();
            const date = d.getDate();
            return (
              <CalendarDay
                key={d.toISOString()}
                date={date}
                subscriptions={SAMPLE[date]}
                display={w % 2 ? 'name' : 'logo'}
                today={inMonth && date === now.getDate()}
                selected={inMonth && date === selected}
                disabled={!inMonth}
                onPress={() => setSelected(date)}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
};
