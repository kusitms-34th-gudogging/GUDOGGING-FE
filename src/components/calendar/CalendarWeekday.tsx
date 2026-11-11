import { Text, View } from 'react-native';

import { cn } from '@/utils/cn';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export const CalendarWeekday = () => (
  <View className="h-[20px] flex-row gap-px">
    {WEEKDAYS.map((day, i) => (
      <Text
        key={day}
        className={cn(
          'w-[47px] text-center text-caption2-semibold',
          i === 0 ? 'text-text-brand' : i === 6 ? 'text-text-tertiary' : 'text-text-primary',
        )}
      >
        {day}
      </Text>
    ))}
  </View>
);
