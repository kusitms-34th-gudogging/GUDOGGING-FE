import { View } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { CalendarDay } from '@/components/calendar/CalendarDay';
import type { CalendarItem } from '@/hooks/useCalendar';
import { cn } from '@/utils/cn';
import { formatDate, monthCells, monthOf, sameDay } from '@/utils/date';

interface CalendarMonthPanelProps {
  page: number;
  offset: SharedValue<number>;
  width: number;
  current: boolean;
  today: Date;
  selected: Date;
  byDate?: Map<string, CalendarItem[]>;
  onSelect: (date: Date) => void;
}

// 한 달 날짜 칸. 자기 page 자리(page × 폭)에 고정돼 있고 offset만큼 같이 밀림
export const CalendarMonthPanel = ({
  page,
  offset,
  width,
  current,
  today,
  selected,
  byDate,
  onSelect,
}: CalendarMonthPanelProps) => {
  const month = monthOf(page);
  const cells = monthCells(month);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: page * width + offset.get() }],
  }));

  return (
    <Animated.View
      style={style}
      accessibilityElementsHidden={!current}
      importantForAccessibility={current ? 'auto' : 'no-hide-descendants'}
      className={cn('absolute inset-x-0 top-0 px-[6px]', !current && 'pointer-events-none')}
    >
      {Array.from({ length: cells.length / 7 }, (_, w) => (
        <View key={w} className="flex-row gap-px">
          {cells.slice(w * 7, w * 7 + 7).map((d) => {
            const inMonth = d.getMonth() === month.getMonth();
            return (
              <CalendarDay
                key={d.toISOString()}
                date={d.getDate()}
                subscriptions={inMonth ? byDate?.get(formatDate(d)) : undefined}
                today={sameDay(d, today)}
                selected={inMonth && sameDay(d, selected)}
                disabled={!inMonth}
                sunday={d.getDay() === 0}
                onPress={() => onSelect(d)}
                className="flex-1"
              />
            );
          })}
        </View>
      ))}
    </Animated.View>
  );
};
