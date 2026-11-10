import { useEffect } from 'react';
import { Image, type ImageSourcePropType, Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { EmptyMonoAsset } from '@/assets/graphics';
import { cn } from '@/utils/cn';

export interface ServiceCardSubscription {
  id: string;
  nextDate: Date;
  logo?: ImageSourcePropType;
}

const MAX_LOGOS = 10;
// 결제일이 가까운 순위별 지름. 1~6위는 Figma 6개 배치의 크기, 7위부터 가장 작은 크기
const SIZES = [36, 30, 29, 26, 21, 17, 17, 17, 17, 17];
// 로고 영역(카드 160 - 위아래 패딩·문구·간격 = 128×98) 안 개수별 중심 좌표 [x, y]
// 가운데로 모으되 서로 10px 이상 떨어지고 위아래 3px은 떠다닐 여유로 남기게 미리 계산해 둔 값. 순서는 SIZES와 같은 순위
const LAYOUTS: [number, number][][] = [
  [[64, 49]],
  [
    [56, 69],
    [72, 29],
  ],
  [
    [41, 37],
    [86, 37],
    [66, 73],
  ],
  [
    [75, 75],
    [33, 60],
    [55, 25],
    [92, 36],
  ],
  [
    [46, 76],
    [89, 66],
    [63, 34],
    [25, 38],
    [98, 30],
  ],
  [
    [27, 43],
    [95, 32],
    [50, 80],
    [89, 71],
    [60, 19],
    [64, 49],
  ],
  [
    [105, 43],
    [42, 18],
    [27, 55],
    [84, 79],
    [64, 49],
    [52, 78],
    [76, 20],
  ],
  [
    [107, 64],
    [32, 22],
    [64, 49],
    [95, 24],
    [45, 81],
    [65, 14],
    [30, 56],
    [74, 82],
  ],
  [
    [25, 21],
    [95, 18],
    [89, 80],
    [51, 82],
    [23, 61],
    [62, 24],
    [77, 48],
    [105, 51],
    [50, 49],
  ],
  [
    [28, 21],
    [100, 18],
    [73, 77],
    [35, 82],
    [12, 57],
    [65, 14],
    [99, 53],
    [107, 80],
    [48, 52],
    [73, 41],
  ],
];
// 제자리에서 아주 조금 떠다님 (위아래 2px)
const FLOAT_PX = 2;
// Figma 카드 안쪽 그림자. NativeWind shadow 클래스는 inset을 버려서 RN boxShadow로 (토큰 없음)
const CARD_INSET_SHADOW = { boxShadow: '0px 3px 3px 0px rgba(183, 183, 183, 0.08) inset' };

// 결제일이 가까운 순으로 최대 10개, 가까울수록 크게. 반환 x·y는 로고 왼쪽 위
export const placeLogos = (subscriptions: ServiceCardSubscription[]) => {
  const ranked = [...subscriptions]
    .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime())
    .slice(0, MAX_LOGOS);
  const layout = LAYOUTS[ranked.length - 1] ?? [];
  return ranked.map((s, i) => ({
    ...s,
    size: SIZES[i],
    x: layout[i][0] - SIZES[i] / 2,
    y: layout[i][1] - SIZES[i] / 2,
  }));
};

interface FloatingLogoProps {
  logo: ImageSourcePropType;
  size: number;
  x: number;
  y: number;
  index: number;
}

// 위아래로 천천히 떠다님. 로고마다 주기(3.6~5초)·시작을 달리해 같이 움직이지 않게 (동작 줄이기면 정지)
const FloatingLogo = ({ logo, size, x, y, index }: FloatingLogoProps) => {
  const reduceMotion = useReducedMotion();
  const float = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    const duration = 1800 + ((index * 370) % 700);
    float.set(
      withDelay(
        index * 230,
        withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true),
      ),
    );
  }, [reduceMotion, float, index]);

  // 위치·크기는 개수에 따라 달라지는 값이라 클래스 대신 여기서 줌
  const style = useAnimatedStyle(() => ({
    left: x,
    top: y,
    width: size,
    height: size,
    transform: [{ translateY: (float.get() * 2 - 1) * FLOAT_PX }],
  }));

  return (
    <Animated.View
      style={style}
      className="absolute overflow-hidden rounded-full border-default border-border-subtle"
    >
      <Image source={logo} className="size-full" />
    </Animated.View>
  );
};

interface ServiceCardProps {
  label: string;
  // 없으면 '구독 등록 x' 모양
  subscriptions: ServiceCardSubscription[];
  onPress?: () => void;
  className?: string;
}

// Figma service card: 정사각(375 기준 160), 폭은 사용처가 정함
// 등록한 구독이 있으면 로고가 떠다니고, 없으면 빈 상자 그래픽
export const ServiceCard = ({ label, subscriptions, onPress, className }: ServiceCardProps) => {
  const logos = placeLogos(subscriptions);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={!onPress}
      onPress={onPress}
      style={CARD_INSET_SHADOW}
      className={cn(
        'aspect-square items-center justify-end gap-stack-md overflow-hidden rounded-card bg-bg-subtle p-inset-md',
        className,
      )}
    >
      {logos.length > 0 ? (
        <View
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          className="h-[98px] w-[128px]"
        >
          {logos.map((l, i) => (
            <FloatingLogo
              key={l.id}
              logo={l.logo ?? require('@/assets/images/logo_placeholder.png')}
              size={l.size}
              x={l.x}
              y={l.y}
              index={i}
            />
          ))}
        </View>
      ) : (
        // Figma: 빈 상자 그래픽은 opacity/pressed로 흐리게, 문구와 14 (카드 gap 12 + 2)
        <EmptyMonoAsset className="mb-[2px] size-[64px] opacity-pressed" />
      )}
      <Text className="text-center text-text-primary text-caption1-semibold">{label}</Text>
    </Pressable>
  );
};
