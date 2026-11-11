import { Blur, Canvas, Circle, Group, RadialGradient, vec } from '@shopify/react-native-skia';
import { colors } from '@tokens';
import { type ReactNode, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/utils/cn';

// 노션 "점검 결과 인터랙션" 값. 그래픽 영역 287 × 236 기준
// 띠가 지름 258 + 블러까지 퍼져 236 영역을 넘음 → 캔버스를 사방 PAD만큼 넓혀 잘리지 않게
const PAD = 48;
const C = vec(143.5 + PAD, 118 + PAD);
const CORE_R = 75;
const BAND_FROM = 87.4;
const BAND_TO = 257.6;
const BAND_STROKE = 18;
const COUNT_MS = 800;

// 활용도 구간. 진입 순간 최종 값으로 한 번만 정함 (숫자가 올라가는 동안 바뀌면 깜빡임)
const TIERS = [
  { min: 80, palette: colors.success, core: 500, tint: 300, inverse: false, bands: 3, cycle: 4400 },
  { min: 60, palette: colors.success, core: 400, tint: 200, inverse: false, bands: 3, cycle: 5000 },
  { min: 40, palette: colors.warning, core: 500, tint: 300, inverse: false, bands: 2, cycle: 5600 },
  { min: 0, palette: colors.red, core: 500, tint: 300, inverse: true, bands: 1, cycle: 6300 },
] as const;

const emit = Easing.bezierFn(0.2, 0.6, 0.3, 1);
const enter = Easing.bezier(0.2, 0.8, 0.2, 1);

// 띠 i: 주기의 i/개수 지점에서 출발해 지름 87 → 258로 퍼지며 투명도 0 → 29%(12% 지점) → 0
const Band = ({
  t,
  index,
  count,
  color,
  still,
}: {
  t: SharedValue<number>;
  index: number;
  count: number;
  color: string;
  still?: { d: number; opacity: number };
}) => {
  const p = useDerivedValue(() => (t.value + index / count) % 1);
  const r = useDerivedValue(() =>
    still ? still.d / 2 : (BAND_FROM + (BAND_TO - BAND_FROM) * emit(p.value)) / 2,
  );
  const opacity = useDerivedValue(() => {
    if (still) return still.opacity;
    const k = p.value < 0.12 ? p.value / 0.12 : 1 - (p.value - 0.12) / 0.88;
    return 0.9 * k * 0.32;
  });

  return (
    <Circle c={C} r={r} style="stroke" strokeWidth={BAND_STROKE} color={color} opacity={opacity}>
      <Blur blur={7} />
    </Circle>
  );
};

// 동작 줄이기 정지 화면 (Figma 컴포넌트 값). 띠 1개 구간은 218만
const STILL = [
  { d: 218, opacity: 0.16 },
  { d: 176, opacity: 0.22 },
];

interface UsageBreathProps {
  /** 활용도(%) 정수 */
  usage: number;
  /** 숫자 아래 문구의 서비스명 (예: 넷플릭스 활용도) */
  name: string;
  /** 그래픽 위 헤더(로고·점검 완료 문구). 진입 시 그래픽과 함께 떠오름 */
  children?: ReactNode;
}

// K-80 활용도 숨 블러: 중심이 숨 쉬듯 커졌다 작아지고 띠가 바깥으로 퍼짐. 숫자는 0에서 1회 올라감
export const UsageBreath = ({ usage, name, children }: UsageBreathProps) => {
  const reduceMotion = useReducedMotion();
  // 숫자(count)가 올라가는 동안에도 최종 값(usage)으로 정하므로 색·띠가 바뀌지 않음
  const tier = TIERS.find((x) => usage >= x.min)!;
  const core = tier.palette[tier.core];
  const tint = tier.palette[tier.tint];

  const t = useSharedValue(0);
  const shown = useSharedValue(reduceMotion ? 1 : 0);
  const [count, setCount] = useState(reduceMotion ? usage : 0);

  useEffect(() => {
    if (reduceMotion) return;
    shown.value = withTiming(1, { duration: 500, easing: enter });
    t.value = withRepeat(withTiming(1, { duration: tier.cycle, easing: Easing.linear }), -1);

    // 숫자: 0.8초 ease-out cubic, 1 단위 정수 (데모와 같이 반올림)
    // ponytail: 화면 밖으로 스크롤돼도 숨·파동은 계속 돎. 배터리 문제 보이면 보일 때만 돌게
    const start = Date.now();
    let frame = requestAnimationFrame(function tick() {
      const k = Math.min(1, (Date.now() - start) / COUNT_MS);
      setCount(Math.round(usage * (1 - (1 - k) ** 3)));
      if (k < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [reduceMotion, usage, tier.cycle, t, shown]);

  // 중심: 0.92 ↔ 1.05배, 투명도 75 ↔ 100% (ease-in-out 왕복)
  const k = useDerivedValue(() => (reduceMotion ? 1 : (1 - Math.cos(2 * Math.PI * t.value)) / 2));
  const coreTransform = useDerivedValue(() => [
    { scale: reduceMotion ? 1 : 0.92 + 0.13 * k.value },
  ]);
  const coreOpacity = useDerivedValue(() => 0.75 + 0.25 * k.value);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ translateY: 14 * (1 - shown.value) }],
  }));

  const textColor = tier.inverse ? 'text-text-inverse' : 'text-text-primary';

  return (
    <Animated.View style={cardStyle} className="gap-s24">
      {children}
      <View className="h-[236px] w-[287px] self-center">
        <Canvas
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
          className="absolute -inset-[48px]"
        >
          {Array.from({ length: tier.bands }, (_, i) => (
            <Band
              key={i}
              t={t}
              index={i}
              count={tier.bands}
              color={core}
              still={reduceMotion ? STILL[i] : undefined}
            />
          ))}
          <Group origin={C} transform={coreTransform} opacity={coreOpacity}>
            <Circle c={C} r={CORE_R}>
              <RadialGradient
                c={C}
                r={CORE_R}
                colors={[core, `${core}B3`, `${tint}00`]}
                positions={[0, 0.45, 1]}
              />
              <Blur blur={8} />
            </Circle>
          </Group>
        </Canvas>

        <View
          accessible
          accessibilityLabel={`${name} 활용도 ${usage}퍼센트`}
          className="absolute inset-x-0 top-[88px] items-center"
        >
          <View className="flex-row items-end">
            {/* 올라가는 동안 자릿수 폭이 흔들리지 않게 고정폭 숫자 */}
            <Text className={cn('tabular-nums text-display-bold', textColor)}>{count}</Text>
            <Text className={cn('text-head3-bold', textColor)}>%</Text>
          </View>
          <Text className={cn('text-caption1-bold', textColor)}>{name} 활용도</Text>
        </View>
      </View>
    </Animated.View>
  );
};
