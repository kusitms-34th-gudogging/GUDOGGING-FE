import { motion } from '@tokens';
import { useEffect, useRef, useState } from 'react';
import type { LayoutChangeEvent, LayoutRectangle } from 'react-native';
import { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

// 선택된 칸 위치·너비로 배경 표시를 미끄러뜨림 (SegmentedControl·TabBar)
export const useSlidingIndicator = (selectedIndex: number) => {
  const [layouts, setLayouts] = useState<Record<number, LayoutRectangle>>({});
  const x = useSharedValue(0);
  const width = useSharedValue(0);
  const placed = useRef(false);
  const target = layouts[selectedIndex];

  useEffect(() => {
    if (!target) return;
    // 첫 배치는 애니메이션 없이 제자리에
    if (!placed.current) {
      x.set(target.x);
      width.set(target.width);
      placed.current = true;
      return;
    }
    const config = { duration: motion.transition, easing: Easing.bezier(...motion['ease-move']) };
    x.set(withTiming(target.x, config));
    width.set(withTiming(target.width, config));
  }, [target, x, width]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: width.get(),
    transform: [{ translateX: x.get() }],
  }));

  const onItemLayout = (index: number) => (e: LayoutChangeEvent) => {
    const { layout } = e.nativeEvent;
    setLayouts((prev) => ({ ...prev, [index]: layout }));
  };

  return { indicatorStyle, onItemLayout, ready: !!target };
};
