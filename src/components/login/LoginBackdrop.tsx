import {
  Blur,
  Canvas,
  drawAsImage,
  Group,
  Image,
  LinearGradient,
  Path,
  Skia,
  type SkImage,
  vec,
} from '@shopify/react-native-skia';
import { useEffect, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import {
  type SharedValue,
  useDerivedValue,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';

// 로그인 → 처리 중 전환 길이(초). progress는 0 ~ LOGIN_TRANSITION_SEC를 오간다
export const LOGIN_TRANSITION_SEC = 0.9;

// 노션 "로그인 인터랙션" 제안값. 실기기에서 느려 보여 2.2배 (2026-11-06)
const SPEED = 2.2;
const FRAME_WIDTH = 375;
const BLUR_SIGMA = 70;
// 백그라운드 복귀 직후 한 프레임에 시간이 튀지 않게 (ms)
const MAX_FRAME_MS = 50;
const SHIFT = { x: 66, y: -72 };
const DEG = Math.PI / 180;

type Sine = readonly [amplitude: number, period: number, phase: number];

// Figma L-01/L-02 블러 원본(SVG path·그라디언트). 중심은 회전된 프레임 기준 좌표
const BLUR_1 = {
  width: 755.801,
  height: 849.297,
  d: 'M615.801 390.559C615.801 547.766 504.659 709.297 337.607 709.297C170.555 709.297 140 538.316 140 381.109C140 223.902 170.555 140 337.607 140C504.659 140 615.801 233.352 615.801 390.559Z',
  center: { x: -5.648, y: 292.463 },
  rotation: 150,
  xOffset: 95,
  x: [
    [95, 12.7, -Math.PI / 2],
    [24, 5.3, 1.2],
  ] as readonly Sine[],
  y: [
    [56, 9.1, 0.8],
    [18, 4.3, 2.1],
  ] as readonly Sine[],
  r: [10, 11.7, 0.4] as Sine,
  s: [0.09, 8.3, 1.7] as Sine,
  red: {
    start: [219.161, -88.8254],
    end: [269.163, 860.897],
    colors: ['#FFF2F1', '#FA2D48', '#D50333'],
    positions: [0.103476, 0.63531, 1],
  },
  green: {
    start: [309.79, -99.3705],
    end: [179.749, 842.735],
    colors: ['#FEF3E7', '#018761', '#EBF9F2'],
    positions: [0.223843, 0.663759, 1],
  },
} as const;

const BLUR_2 = {
  width: 683.677,
  height: 763,
  d: 'M543.677 352.578C543.677 485.954 449.382 623 307.653 623C165.924 623 140 477.937 140 344.56C140 211.183 165.924 140 307.653 140C449.382 140 543.677 219.201 543.677 352.578Z',
  center: { x: 275.49, y: 501.49 },
  rotation: -45,
  x: [
    [34, 10.9, 2],
    [10, 5.3, 0.5],
  ] as readonly Sine[],
  y: [
    [28, 13.1, 0],
    [10, 6.1, 1],
  ] as readonly Sine[],
  r: [8, 15.3, 2.6] as Sine,
  s: [0.06, 11.3, 0.3] as Sine,
} as const;

const sine = ([amplitude, period, phase]: Sine, t: number) => {
  'worklet';
  return amplitude * Math.sin((2 * Math.PI * t) / period + phase);
};

const easeOutCubic = (x: number) => {
  'worklet';
  const c = Math.min(1, Math.max(0, x));
  return 1 - (1 - c) ** 3;
};

const gradientPath = (d: string, g?: typeof BLUR_1.red | typeof BLUR_1.green) => (
  <Path path={Skia.Path.MakeFromSVGString(d)!} color="#FEF3E7" dither>
    {g && (
      <LinearGradient
        start={vec(g.start[0], g.start[1])}
        end={vec(g.end[0], g.end[1])}
        colors={[...g.colors]}
        positions={[...g.positions]}
      />
    )}
    <Blur blur={BLUR_SIGMA} />
  </Path>
);

// 블러는 형태가 안 바뀌므로 한 번만 그려 이미지로 만들고, 이후엔 이동·회전·크기만 바꿈
const useBlurImages = () => {
  const [images, setImages] = useState<{ blur2: SkImage; red: SkImage; green: SkImage }>();

  useEffect(() => {
    let cancelled = false;
    const size1 = { width: BLUR_1.width, height: BLUR_1.height };
    const size2 = { width: BLUR_2.width, height: BLUR_2.height };

    Promise.all([
      drawAsImage(gradientPath(BLUR_2.d), size2),
      drawAsImage(gradientPath(BLUR_1.d, BLUR_1.red), size1),
      drawAsImage(gradientPath(BLUR_1.d, BLUR_1.green), size1),
    ]).then(([blur2, red, green]) => {
      if (!cancelled && blur2 && red && green) setImages({ blur2, red, green });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return images;
};

interface LoginBackdropProps {
  /** 0(L-01) ~ LOGIN_TRANSITION_SEC(L-02). 빨강→초록 전환·이동·가속을 이 값 하나로 만듦 */
  progress: SharedValue<number>;
}

export const LoginBackdrop = ({ progress }: LoginBackdropProps) => {
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const images = useBlurImages();
  const t = useSharedValue(0);

  useFrameCallback(({ timeSincePreviousFrame }) => {
    if (reduceMotion) return;
    const dt = Math.min(timeSincePreviousFrame ?? 0, MAX_FRAME_MS) / 1000;
    t.value += dt * SPEED * (1 + 0.6 * easeOutCubic(progress.value / LOGIN_TRANSITION_SEC));
  });

  const frame = useDerivedValue(() => [{ scale: width / FRAME_WIDTH }]);

  const blur1Transform = useDerivedValue(() => {
    const e = reduceMotion ? 0 : easeOutCubic(progress.value / LOGIN_TRANSITION_SEC);
    const dx = BLUR_1.xOffset + sine(BLUR_1.x[0], t.value) + sine(BLUR_1.x[1], t.value);
    const dy = sine(BLUR_1.y[0], t.value) + sine(BLUR_1.y[1], t.value);
    return [
      { translateX: BLUR_1.center.x + dx + SHIFT.x * e },
      { translateY: BLUR_1.center.y + dy + SHIFT.y * e },
      { rotate: (BLUR_1.rotation + sine(BLUR_1.r, t.value)) * DEG },
      { scale: 1 + sine(BLUR_1.s, t.value) },
      { translateX: -BLUR_1.width / 2 },
      { translateY: -BLUR_1.height / 2 },
    ];
  });

  const blur2Transform = useDerivedValue(() => [
    { translateX: BLUR_2.center.x + sine(BLUR_2.x[0], t.value) + sine(BLUR_2.x[1], t.value) },
    { translateY: BLUR_2.center.y + sine(BLUR_2.y[0], t.value) + sine(BLUR_2.y[1], t.value) },
    { rotate: (BLUR_2.rotation + sine(BLUR_2.r, t.value)) * DEG },
    { scale: 1 + sine(BLUR_2.s, t.value) },
    { translateX: -BLUR_2.width / 2 },
    { translateY: -BLUR_2.height / 2 },
  ]);

  // 빨강을 먼저 지우고 초록을 늦게 올려야 가장자리가 회갈색으로 탁해지지 않음
  const redOpacity = useDerivedValue(() => 1 - easeOutCubic(progress.value / 0.5));
  const greenOpacity = useDerivedValue(() => easeOutCubic((progress.value - 0.18) / 0.72));

  return (
    <View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      className="absolute inset-0"
    >
      <Canvas className="flex-1">
        {images && (
          <Group transform={frame}>
            <Group transform={blur2Transform}>
              <Image image={images.blur2} width={BLUR_2.width} height={BLUR_2.height} />
            </Group>
            <Group transform={blur1Transform}>
              <Group opacity={redOpacity}>
                <Image image={images.red} width={BLUR_1.width} height={BLUR_1.height} />
              </Group>
              <Group opacity={greenOpacity}>
                <Image image={images.green} width={BLUR_1.width} height={BLUR_1.height} />
              </Group>
            </Group>
          </Group>
        )}
      </Canvas>
    </View>
  );
};
