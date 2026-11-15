import { colors } from '@tokens';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type WithTimingConfig,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

// asset/category/productivity(24 그리드)를 별 3조각으로 나눠 104로 그림. 조각마다 따로 움직이려고 레이어를 나눔
const { surface, icon } = colors.category.productivity;
const PIECES = {
  big: {
    d: 'M10 4.5C10.75 9.25 12.75 11.25 17.5 12C12.75 12.75 10.75 14.75 10 19.5C9.25 14.75 7.25 12.75 2.5 12C7.25 11.25 9.25 9.25 10 4.5Z',
    fill: surface,
    // 회전·크기 기준점 = 조각 중심 (24 그리드 → %)
    origin: '41.67% 50%',
  },
  small: {
    d: 'M18 2C18.35 4.2 19.3 5.15 21.5 5.5C19.3 5.85 18.35 6.8 18 9C17.65 6.8 16.7 5.85 14.5 5.5C16.7 5.15 17.65 4.2 18 2Z',
    fill: icon,
    origin: '75% 22.92%',
  },
  dot: {
    d: 'M19 17C19.8284 17 20.5 17.6716 20.5 18.5C20.5 19.3284 19.8284 20 19 20C18.1716 20 17.5 19.3284 17.5 18.5C17.5 17.6716 18.1716 17 19 17Z',
    fill: icon,
    origin: '79.17% 77.08%',
  },
};

const POP = Easing.bezier(0.2, 0.9, 0.3, 1.3);
const SNAP = Easing.bezier(0.2, 0.8, 0.3, 1);
const EASE = Easing.inOut(Easing.ease);
const to = (value: number, duration: number, easing: WithTimingConfig['easing'] = EASE) =>
  withTiming(value, { duration, easing });
// 시작 지연 후 한 주기(steps)를 무한 반복
const loop = (delay: number, ...steps: number[]) =>
  withDelay(delay, withRepeat(withSequence(...steps), -1));

// 탈퇴 완료(E-9) 아이콘: 큰 별·작은 별·점이 차례로 튀어나온 뒤 크기별로 다르게 반짝임
// 동작 줄이기면 등장만 하고 반짝이지 않음
export const SparklingStarsIcon = () => {
  const reduceMotion = useReducedMotion();
  const bigIn = useSharedValue(0);
  const smallIn = useSharedValue(0);
  const dotIn = useSharedValue(0);
  const bigPulse = useSharedValue(1);
  const smallScale = useSharedValue(1);
  const smallRotate = useSharedValue(0);
  const smallOpacity = useSharedValue(1);
  const dotPulse = useSharedValue(1);
  const dotOpacity = useSharedValue(1);

  useEffect(() => {
    bigIn.set(to(1, 360, POP));
    smallIn.set(withDelay(120, to(1, 360, POP)));
    dotIn.set(withDelay(240, to(1, 300, POP)));
    if (reduceMotion) return;
    // 큰 별 2.4초: 기준점이라 살짝만
    bigPulse.set(loop(800, to(1.06, 1200), to(1, 1200)));
    // 작은 별 1.7초: 빠르게 커지고 천천히 줄어든 뒤 멈춤
    smallScale.set(loop(1000, to(1.25, 204, SNAP), to(0.7, 493), to(1, 493), to(1, 510)));
    smallRotate.set(loop(1000, to(15, 204, SNAP), to(8, 493), to(0, 493), to(0, 510)));
    smallOpacity.set(loop(1000, to(1, 204, SNAP), to(0.5, 493), to(1, 493), to(1, 510)));
    // 점 1.3초
    dotPulse.set(loop(1400, to(0.5, 650), to(1, 650)));
    dotOpacity.set(loop(1400, to(0.35, 650), to(1, 650)));
  }, [
    reduceMotion,
    bigIn,
    smallIn,
    dotIn,
    bigPulse,
    smallScale,
    smallRotate,
    smallOpacity,
    dotPulse,
    dotOpacity,
  ]);

  const bigStyle = useAnimatedStyle(() => ({
    transformOrigin: PIECES.big.origin,
    opacity: Math.min(bigIn.get(), 1),
    transform: [{ scale: (0.6 + 0.4 * bigIn.get()) * bigPulse.get() }],
  }));
  const smallStyle = useAnimatedStyle(() => ({
    transformOrigin: PIECES.small.origin,
    opacity: smallOpacity.get(),
    transform: [{ scale: smallIn.get() * smallScale.get() }, { rotate: `${smallRotate.get()}deg` }],
  }));
  const dotStyle = useAnimatedStyle(() => ({
    transformOrigin: PIECES.dot.origin,
    opacity: dotOpacity.get(),
    transform: [{ scale: dotIn.get() * dotPulse.get() }],
  }));

  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      className="size-[104px]"
    >
      {(
        [
          [PIECES.big, bigStyle],
          [PIECES.small, smallStyle],
          [PIECES.dot, dotStyle],
        ] as const
      ).map(([piece, style]) => (
        <Animated.View key={piece.d} style={style} className="absolute inset-0">
          <Svg width={104} height={104} viewBox="0 0 24 24">
            <Path d={piece.d} fill={piece.fill} />
          </Svg>
        </Animated.View>
      ))}
    </View>
  );
};
