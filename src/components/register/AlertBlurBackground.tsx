import { colors } from '@tokens';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  FeGaussianBlur,
  Filter,
  LinearGradient,
  RadialGradient,
  Stop,
} from 'react-native-svg';

// 0 ↔ 1 왕복 무한 반복 (ms는 한 방향 시간)
const pingPong = (ms: number) =>
  withRepeat(withTiming(1, { duration: ms, easing: Easing.inOut(Easing.ease) }), -1, true);

const ICON_POOL = [
  [0, 1],
  [0.3, 0.96],
  [0.45, 0.82],
  [0.6, 0.55],
  [0.75, 0.27],
  [0.88, 0.08],
  [1, 0],
];
const TEXT_POOL = [
  [0, 1],
  [0.5, 1],
  [0.6, 0.93],
  [0.7, 0.75],
  [0.8, 0.48],
  [0.9, 0.2],
  [0.96, 0.06],
  [1, 0],
];

// 인식 실패(A-08e·A-12e) 배경: 빨간 블러가 계속 일렁이고, 아이콘·문구 뒤 흰 영역은 고정
// 812 프레임 기준 좌표를 확대 없이 상태바(44) 위부터 깔아 확인 중 화면과 그래픽 위치를 맞춤
export const AlertBlurBackground = () => {
  const reduceMotion = useReducedMotion();
  const fade = useSharedValue(reduceMotion ? 1 : 0);
  const wash = useSharedValue(0);
  const washTone = useSharedValue(0);
  const core = useSharedValue(0);
  const coreTone = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    fade.set(withTiming(1, { duration: 700, easing: Easing.out(Easing.ease) }));
    // 주기를 서로 다르게 잡아 같은 박자로 깜빡이지 않게
    wash.set(pingPong(5300));
    washTone.set(pingPong(2700));
    core.set(pingPong(3900));
    coreTone.set(pingPong(2100));
  }, [reduceMotion, fade, wash, washTone, core, coreTone]);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.get() }));
  // 동작 줄이기면 Figma 정지 값 (연한 50%, 빨강 20%)
  const washStyle = useBlobStyle(wash, washTone, reduceMotion, {
    x: [-26, 26],
    y: [-14, 16],
    rotate: [-6, 6],
    scale: [0.96, 1.05],
    opacity: [0.3, 0.6],
    still: 0.5,
  });
  const coreStyle = useBlobStyle(core, coreTone, reduceMotion, {
    x: [20, -22],
    y: [-22, 18],
    rotate: [8, -8],
    scale: [1.06, 0.94],
    opacity: [0.08, 0.26],
    still: 0.2,
  });

  return (
    <View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      className="pt-safe absolute inset-x-0 top-0 items-center"
    >
      <View className="-mt-status-bar h-screen-height w-screen-width">
        <Animated.View style={fadeStyle} className="absolute inset-0">
          {/* 연한 블러: 중심 (188, 280), 지름 440, sigma 60. 블러가 번질 여유까지 포함한 800 틀 */}
          <Animated.View style={washStyle} className="absolute -left-[212px] -top-[120px]">
            <Svg width={800} height={800} viewBox="-212 -120 800 800">
              <Defs>
                <Filter
                  id="wash"
                  filterUnits="userSpaceOnUse"
                  x={-212}
                  y={-120}
                  width={800}
                  height={800}
                >
                  <FeGaussianBlur stdDeviation={60} />
                </Filter>
              </Defs>
              <Circle cx={188} cy={280} r={220} fill={colors.red['200']} filter="url(#wash)" />
            </Svg>
          </Animated.View>
          {/* 빨강 블러: 중심 (188, 280), 지름 300, sigma 60 */}
          <Animated.View style={coreStyle} className="absolute -left-[142px] -top-[50px]">
            <Svg width={660} height={660} viewBox="-142 -50 660 660">
              <Defs>
                <LinearGradient
                  id="core-fill"
                  gradientUnits="userSpaceOnUse"
                  x1={113}
                  y1={150.094}
                  x2={263}
                  y2={409.906}
                >
                  <Stop offset={0} stopColor={colors.red['600']} />
                  <Stop offset={1} stopColor={colors.red['500']} />
                </LinearGradient>
                <Filter
                  id="core"
                  filterUnits="userSpaceOnUse"
                  x={-142}
                  y={-50}
                  width={660}
                  height={660}
                >
                  <FeGaussianBlur stdDeviation={60} />
                </Filter>
              </Defs>
              <Circle cx={188} cy={280} r={150} fill="url(#core-fill)" filter="url(#core)" />
            </Svg>
          </Animated.View>
        </Animated.View>
        {/* 아이콘·문구 뒤 흰 영역은 움직이지 않아 글자 뒤가 항상 밝음 */}
        <Svg
          width={560}
          height={442}
          viewBox="-92 218 560 442"
          className="absolute -left-[92px] top-[218px]"
        >
          <Defs>
            <RadialGradient id="icon-pool">
              {ICON_POOL.map(([offset, opacity]) => (
                <Stop key={offset} offset={offset} stopColor={colors.white} stopOpacity={opacity} />
              ))}
            </RadialGradient>
            <RadialGradient id="text-pool">
              {TEXT_POOL.map(([offset, opacity]) => (
                <Stop key={offset} offset={offset} stopColor={colors.white} stopOpacity={opacity} />
              ))}
            </RadialGradient>
          </Defs>
          <Circle cx={188} cy={368} r={150} fill="url(#icon-pool)" />
          <Ellipse cx={188} cy={500} rx={280} ry={160} fill="url(#text-pool)" />
        </Svg>
      </View>
    </View>
  );
};

interface BlobRange {
  x: [number, number];
  y: [number, number];
  rotate: [number, number];
  scale: [number, number];
  opacity: [number, number];
  still: number;
}

// 움직임·진하기를 각자 0 ↔ 1 진행값에서 범위로 옮김
const useBlobStyle = (
  move: SharedValue<number>,
  tone: SharedValue<number>,
  reduceMotion: boolean,
  r: BlobRange,
) =>
  useAnimatedStyle(() => {
    if (reduceMotion) return { opacity: r.still };
    const m = move.get();
    return {
      opacity: interpolate(tone.get(), [0, 1], r.opacity),
      transform: [
        { translateX: interpolate(m, [0, 1], r.x) },
        { translateY: interpolate(m, [0, 1], r.y) },
        { rotate: `${interpolate(m, [0, 1], r.rotate)}deg` },
        { scale: interpolate(m, [0, 1], r.scale) },
      ],
    };
  });
