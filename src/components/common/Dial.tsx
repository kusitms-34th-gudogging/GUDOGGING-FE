import { colors } from '@tokens';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { type FlatList, Pressable, View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  type SharedValue,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { cn } from '@/utils/cn';

// Dial row 높이 (size 토큰 없음). 5줄 보이므로 위아래 2줄(72px) 여백
const ROW_HEIGHT = 36;
// 손을 뗀 뒤 미끄러지는 정도. iOS 피커와 손맛 비교하며 조절 (0.99 = 'fast', 0.998 = 'normal')
const DECELERATION_RATE = 0.998;

// 선택 줄과의 거리 0(Selected)·1(Near)·2(Far) → head4-bold·body1-regular·body2-regular
const DISTANCES = [0, 1, 2];
const SCALES = [18 / 16, 1, 15 / 16];
const COLORS = [colors.text.primary, colors.text.tertiary, colors.text.disabled];

interface DialRowProps {
  label: string;
  index: number;
  initiallySelected: boolean;
  scrollY: SharedValue<number>;
  onPress: () => void;
}

// 가운데 줄은 head4-bold, 나머지는 body1-regular 기준으로 거리에 따라 크기·색을 보간
// 굵기는 UI 스레드에서 바꾸면 글자 폭이 다시 계산되지 않아 잘림 → 클래스로 전환
// 가운데인지는 줄마다 UI 스레드에서 판단 → 칸이 바뀔 때 두 줄만 다시 그림 (빠르게 넘겨도 JS 스레드가 안 막힘)
const DialRow = ({ label, index, initiallySelected, scrollY, onPress }: DialRowProps) => {
  const [selected, setSelected] = useState(initiallySelected);
  useAnimatedReaction(
    () => Math.round(scrollY.get() / ROW_HEIGHT) === index,
    (current, previous) => {
      if (current !== previous) scheduleOnRN(setSelected, current);
    },
  );
  const textStyle = useAnimatedStyle(() => {
    const distance = Math.abs(scrollY.get() / ROW_HEIGHT - index);
    return {
      color: interpolateColor(distance, DISTANCES, COLORS),
      transform: [{ scale: selected ? 1 : interpolate(distance, DISTANCES, SCALES, 'clamp') }],
    };
  });

  return (
    // iOS 피커처럼 위아래 줄을 탭하면 그 줄로 굴러감
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="h-[36px] items-end justify-center"
    >
      <Animated.Text
        className={cn('origin-right', selected ? 'text-head4-bold' : 'text-body1-regular')}
        style={textStyle}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
};

interface DialColumnProps {
  items: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  accessibilityLabel: string;
  // false면 끝에서 멈춤 (연도)
  loop: boolean;
}

// 순환: 같은 목록을 LOOP_COPIES번 이어 붙이고 가운데 바퀴에서 시작
// ponytail: 끝에 닿으려면 수백 바퀴를 돌려야 해서 가운데로 되돌리는 처리는 생략. 실제로 닿으면 멈출 때 가운데로 점프
const LOOP_COPIES = 1000;
const loopStartIndex = (length: number, selectedIndex: number) =>
  (LOOP_COPIES / 2) * length + selectedIndex;
// 현재 위치에서 selectedIndex가 있는 가장 가까운 칸 (앞뒤 중 짧은 쪽)
const nearestLoopIndex = (current: number, selectedIndex: number, length: number) => {
  const diff = (((selectedIndex - (current % length)) % length) + length) % length;
  return current + (diff > length / 2 ? diff - length : diff);
};

const FRAME_MS = 16;
// 칸마다 울리는 진동 세기. iOS 피커 기본(selection)보다 강하게. Light < Medium < Heavy, Rigid는 짧고 딱 끊김
const TICK_STYLE = Haptics.ImpactFeedbackStyle.Medium;
const tick = (count: number) => {
  for (let i = 0; i < count; i++) {
    setTimeout(() => void Haptics.impactAsync(TICK_STYLE), (i * FRAME_MS) / count);
  }
};

const DialColumn = ({
  items,
  selectedIndex,
  onSelect,
  accessibilityLabel,
  loop,
}: DialColumnProps) => {
  const length = items.length;
  const listRef = useAnimatedRef<FlatList<number>>();
  const [startIndex] = useState(() =>
    loop ? loopStartIndex(length, selectedIndex) : selectedIndex,
  );
  const data = useMemo(
    () => Array.from({ length: loop ? length * LOOP_COPIES : length }, (_, i) => i),
    [length, loop],
  );
  const scrollY = useSharedValue(startIndex * ROW_HEIGHT);

  // 지나간 칸마다 iOS 피커처럼 선택 진동. 한 프레임에 여러 칸을 지나면 그 프레임 안에 나눠서 울림
  // → 감속하면 진동 간격도 같이 벌어짐
  // ponytail: 진동 장치가 아주 가까운 진동은 하나로 합침. 그보다 빠르면 네이티브 모듈로 UI 스레드에서 직접 울려야 함
  useAnimatedReaction(
    () => Math.round(scrollY.get() / ROW_HEIGHT),
    (current, previous) => {
      if (previous !== null && current !== previous)
        scheduleOnRN(tick, Math.abs(current - previous));
    },
  );

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.set(e.contentOffset.y);
  });

  // 밖에서 값이 바뀌면 가장 가까운 같은 값 칸으로 이동 (일수가 바뀌면 Dial이 열을 새로 그림)
  useEffect(() => {
    const current = Math.round(scrollY.get() / ROW_HEIGHT);
    if (current % length === selectedIndex) return;
    const target = loop ? nearestLoopIndex(current, selectedIndex, length) : selectedIndex;
    listRef.current?.scrollToOffset({ offset: target * ROW_HEIGHT, animated: true });
  }, [selectedIndex, length, loop, listRef, scrollY]);

  const select = (index: number) => {
    const next = loop
      ? ((index % length) + length) % length
      : Math.min(Math.max(index, 0), length - 1);
    if (next !== selectedIndex) onSelect(next);
  };

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: items[selectedIndex] }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) =>
        select(selectedIndex + (e.nativeEvent.actionName === 'increment' ? 1 : -1))
      }
      className="flex-1"
    >
      <Animated.FlatList
        ref={listRef}
        data={data}
        // 줄 탭 핸들러가 최신 selectedIndex를 보도록 (스크롤 중엔 안 바뀜)
        extraData={selectedIndex}
        keyExtractor={String}
        renderItem={({ index }) => (
          <DialRow
            label={items[index % length]}
            index={index}
            initiallySelected={index === startIndex}
            scrollY={scrollY}
            onPress={() => {
              listRef.current?.scrollToOffset({ offset: index * ROW_HEIGHT, animated: true });
              select(index);
            }}
          />
        )}
        // offset은 위 여백 72px을 빼고 계산 → initialScrollIndex로 스크롤하면 그 줄이 가운데 옴
        // (첫 줄 선택도 가능. 실제 위치와 2줄 어긋나는 건 windowSize 여유로 덮음)
        getItemLayout={(_, index) => ({
          length: ROW_HEIGHT,
          offset: index * ROW_HEIGHT,
          index,
        })}
        initialScrollIndex={startIndex}
        initialNumToRender={15}
        windowSize={7}
        onScroll={onScroll}
        scrollEventThrottle={16}
        snapToInterval={ROW_HEIGHT}
        decelerationRate={DECELERATION_RATE}
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={(e) => select(Math.round(e.nativeEvent.contentOffset.y / ROW_HEIGHT))}
        contentContainerClassName="py-[72px]"
      />
    </View>
  );
};

const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

interface DialProps {
  value: Date;
  onValueChange: (date: Date) => void;
  minYear?: number;
  maxYear?: number;
  className?: string;
}

// 연/월/일 선택 다이얼 (다음 결제일 등). 가운데 Selection band는 고정, 숫자만 스크롤
export const Dial = ({
  value,
  onValueChange,
  minYear = new Date().getFullYear(),
  maxYear = minYear + 10,
  className,
}: DialProps) => {
  const years = range(minYear, maxYear);
  const year = value.getFullYear();
  const month = value.getMonth();
  const day = value.getDate();
  // 월·연도가 바뀌어 일수가 줄면 마지막 날로 (1월 31일 → 2월 28일)
  const change = (y: number, m: number, d: number) =>
    onValueChange(new Date(y, m, Math.min(d, daysInMonth(y, m))));

  const columns: DialColumnProps[] = [
    {
      items: years.map((y) => `${y}년`),
      selectedIndex: Math.max(years.indexOf(year), 0),
      onSelect: (i) => change(years[i], month, day),
      accessibilityLabel: '연',
      loop: false,
    },
    {
      items: range(1, 12).map((m) => `${m}월`),
      selectedIndex: month,
      onSelect: (i) => change(year, i, day),
      accessibilityLabel: '월',
      loop: true,
    },
    {
      items: range(1, daysInMonth(year, month)).map((d) => `${d}일`),
      selectedIndex: day - 1,
      onSelect: (i) => change(year, month, i + 1),
      accessibilityLabel: '일',
      loop: true,
    },
  ];

  return (
    <View className={cn('h-[180px] flex-row overflow-hidden pr-s32', className)}>
      <View className="absolute inset-x-0 top-[72px] h-[36px] rounded-md bg-bg-subtle" />
      {columns.map((column) => (
        // 항목 수가 바뀌면 (예: 31일 → 30일) 순환 목록을 새로 만듦
        <DialColumn key={`${column.accessibilityLabel}-${column.items.length}`} {...column} />
      ))}
    </View>
  );
};
