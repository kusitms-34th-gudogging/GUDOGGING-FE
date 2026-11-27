import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/utils/cn';

interface SkeletonProps {
  className?: string;
}

// 로딩 자리 표시 박스: 천천히 깜빡임 (동작 줄이기면 정지). 디자인이 없어 모양(크기·radius)은 사용처가 className으로 정함
export const Skeleton = ({ className }: SkeletonProps) => {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.set(
      withRepeat(withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) }), -1, true),
    );
  }, [reduceMotion, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.get() }));

  return <Animated.View style={style} className={cn('bg-bg-muted', className)} />;
};
