import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { AlertColorAsset } from '@/assets/graphics';

// 0° → −7° → +6° → −3° → 0°
const shake = () =>
  withSequence(
    ...[-7, 6, -3, 0].map((deg) =>
      withTiming(deg, { duration: 162, easing: Easing.inOut(Easing.ease) }),
    ),
  );

// 인식 실패 경고 아이콘: 진입 시 1회 튀어 오르며 나타나 두 번 흔들림 (동작 줄이기면 정지)
export const ShakingAlertIcon = () => {
  const reduceMotion = useReducedMotion();
  const appear = useSharedValue(reduceMotion ? 1 : 0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    appear.set(withTiming(1, { duration: 360, easing: Easing.bezier(0.2, 0.9, 0.3, 1.3) }));
    rotate.set(withDelay(360, withSequence(shake(), withTiming(0, { duration: 144 }), shake())));
  }, [reduceMotion, appear, rotate]);

  const style = useAnimatedStyle(() => ({
    opacity: Math.min(appear.get(), 1),
    transform: [{ scale: 0.6 + 0.4 * appear.get() }, { rotate: `${rotate.get()}deg` }],
  }));

  return (
    <Animated.View style={style} accessible={false} importantForAccessibility="no-hide-descendants">
      <AlertColorAsset className="size-[104px]" />
    </Animated.View>
  );
};
