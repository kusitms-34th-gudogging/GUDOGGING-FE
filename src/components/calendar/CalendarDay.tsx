import { cva } from 'class-variance-authority';
import { Image, type ImageSourcePropType, Pressable, Text, View } from 'react-native';

import type { CheckupCategory } from '@/constants/checkup';
import { cn } from '@/utils/cn';

export interface CalendarDaySubscription {
  id: string;
  name: string;
  category: CheckupCategory;
  logo: ImageSourcePropType;
}

interface CalendarDayProps {
  date: number;
  subscriptions?: CalendarDaySubscription[];
  display?: 'logo' | 'name';
  today?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  className?: string;
}

const MAX_LOGOS = 2;
const MAX_NAMES = 3;

const BAR_COLORS: Record<CheckupCategory, string> = {
  ott: 'bg-category-ott-icon',
  music: 'bg-category-music-icon',
  shopping: 'bg-category-shopping-icon',
  education: 'bg-category-education-icon',
  productivity: 'bg-category-productivity-icon',
  entertainment: 'bg-category-entertainment-icon',
  etc: 'bg-category-etc-icon',
};

type DayState = 'default' | 'today' | 'selected' | 'disabled';

// 선택이 바뀌면 이전 칸은 흐려지고 새 칸은 진해지며 색이 서서히 바뀜. 배경·글자 각각 transition (transition.md)
// 슬라이딩 표시(useSlidingIndicator)는 가로 한 줄용이라 주를 넘나드는 달력엔 안 맞아 칸마다 전환
const circleVariants = cva(
  'size-[28px] items-center justify-center rounded-full transition-colors duration-200',
  {
    variants: {
      // 배경 없는 상태도 bg-transparent로 둬야 선택이 풀릴 때 색이 서서히 빠짐
      state: {
        default: 'bg-transparent',
        today: 'bg-bg-dim',
        selected: 'bg-bg-brand',
        disabled: 'bg-transparent',
      },
    },
  },
);

const dateVariants = cva('text-center transition-colors duration-200', {
  variants: {
    state: {
      default: 'text-body3-semibold text-text-primary',
      today: 'text-body3-semibold text-text-inverse',
      selected: 'text-body3-semibold text-text-on-brand',
      disabled: 'text-body3-regular text-text-disabled',
    },
  },
});

// Figma Calendar day: 날짜 원(28) + 그날 결제 구독 로고(최대 2개, 넘치면 +N) 또는 서비스명(최대 3개)
export const CalendarDay = ({
  date,
  subscriptions = [],
  display = 'logo',
  today,
  selected,
  disabled,
  onPress,
  className,
}: CalendarDayProps) => {
  const state: DayState = disabled
    ? 'disabled'
    : selected
      ? 'selected'
      : today
        ? 'today'
        : 'default';
  const items = disabled ? [] : subscriptions;
  const more = items.length - MAX_LOGOS;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      disabled={disabled}
      onPress={onPress}
      className={cn('h-[72px] w-[47px] items-center gap-s2 px-s2', className)}
    >
      <View className={circleVariants({ state })}>
        <Text className={dateVariants({ state })}>{date}</Text>
      </View>
      {items.length > 0 && (
        <View className="w-full items-center overflow-hidden">
          {display === 'logo' ? (
            <>
              <View className="flex-row gap-s2">
                {items.slice(0, MAX_LOGOS).map((s) => (
                  <Image
                    key={s.id}
                    source={s.logo}
                    accessibilityLabel={s.name}
                    className="size-[20px] rounded-full"
                  />
                ))}
              </View>
              {more > 0 && (
                <Text className="text-center text-text-tertiary text-label-semibold">+{more}</Text>
              )}
            </>
          ) : (
            items.slice(0, MAX_NAMES).map((s) => (
              <View
                key={s.id}
                className="h-[14px] w-full flex-row items-center gap-s2 overflow-hidden"
              >
                <View className={cn('h-[10px] w-[2px] rounded-[1px]', BAR_COLORS[s.category])} />
                <Text
                  numberOfLines={1}
                  className="flex-1 text-text-secondary text-caption2-regular"
                >
                  {s.name}
                </Text>
              </View>
            ))
          )}
        </View>
      )}
    </Pressable>
  );
};
