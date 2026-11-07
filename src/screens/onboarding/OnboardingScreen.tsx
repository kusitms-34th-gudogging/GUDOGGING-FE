import { useRef, useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Cta } from '@/components/common/Cta';
import { TopBar } from '@/components/common/TopBar';
import { NotificationSheet } from '@/components/onboarding/NotificationSheet';
import { OnboardingVisual } from '@/components/onboarding/OnboardingVisual';
import { cn } from '@/utils/cn';

// 화면 높이 계산용 고정 블록 (상단바 · 문구 · CTA + 하단 여백)
const TOP_BAR = 56;
const HEAD = 92;
const CTA_AREA = 72;
const VISUAL_GAP = 8;
const VISUAL_GAP_COMPACT = 24; // 작은 기기: 비주얼 아래끝과 문구 사이 24 이상
const CTA_GAP_COMPACT = 48; // 작은 기기: 문구와 CTA 사이 최소 간격
const VISUAL_RATIO = 436 / 375;
const VISUAL_MIN = 200;

const SWAP_SEC = 0.5;
const STEP_SEC = 0.8;
const SLIDE_PX = 40;

// cubic-bezier(.2, 0, 0, 1)에 가까운 ease-out
const easeOut = (x: number) => {
  'worklet';
  return 1 - (1 - Math.min(1, x)) ** 4;
};

interface OnboardingScreenProps {
  /** OS 알림 권한 요청. 허용·거부와 관계없이 끝나면 시트를 닫고 다음으로 진행 */
  onRequestNotification?: () => Promise<unknown>;
  /** 알림 권한 시트까지 끝났을 때 (구독 등록 시퀀스로 이동) */
  onComplete?: () => void;
}

export const OnboardingScreen = ({ onRequestNotification, onComplete }: OnboardingScreenProps) => {
  const [page, setPage] = useState<1 | 2>(1);
  const [sheetVisible, setSheetVisible] = useState(false);
  const step = useSharedValue(0);
  const reduceMotion = useReducedMotion();
  const finishing = useRef(false);

  // 비주얼은 폭에 맞춘 높이가 기본이고, 안 들어가는 작은 화면(SE 등)에서만 줄임
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const available = height - insets.top - insets.bottom;
  const natural = width * VISUAL_RATIO;
  const compact = available - (TOP_BAR + VISUAL_GAP + HEAD + CTA_AREA) < natural;
  const visualHeight = compact
    ? Math.max(
        VISUAL_MIN,
        available - (TOP_BAR + VISUAL_GAP_COMPACT + HEAD + CTA_GAP_COMPACT + CTA_AREA),
      )
    : natural;

  // 동작 줄이기: 위치 이동 없이 문구만 0.2초 크로스페이드
  const goTo = (next: 1 | 2) => {
    setPage(next);
    step.value = withTiming(next === 2 ? 1 : 0, {
      duration: reduceMotion ? 200 : STEP_SEC * 1000,
      easing: Easing.linear,
    });
  };

  const firstStyle = useAnimatedStyle(() => {
    const p = reduceMotion ? step.value : easeOut((step.value * STEP_SEC) / SWAP_SEC);
    return { opacity: 1 - p, transform: [{ translateX: reduceMotion ? 0 : -SLIDE_PX * p }] };
  });
  const secondStyle = useAnimatedStyle(() => {
    const p = reduceMotion ? step.value : easeOut((step.value * STEP_SEC) / SWAP_SEC);
    return { opacity: p, transform: [{ translateX: reduceMotion ? 0 : SLIDE_PX * (1 - p) }] };
  });

  // 알림 받기: OS 응답까지 기다린 뒤 시트를 닫음 / 다음에 설정하기: 요청 없이 바로 닫음
  const finish = async (requestPermission: boolean) => {
    if (finishing.current) return;
    finishing.current = true;
    try {
      if (requestPermission) await onRequestNotification?.();
    } finally {
      setSheetVisible(false);
      finishing.current = false;
    }
    onComplete?.();
  };

  return (
    <View className="flex-1 bg-bg-default">
      <SafeAreaView
        className="flex-1"
        importantForAccessibility={sheetVisible ? 'no-hide-descendants' : 'auto'}
      >
        <TopBar
          variant="detail"
          title="구도깅 소개"
          showBack={page === 2}
          onBack={() => goTo(1)}
          showAction1={false}
          showAction2={false}
          showTextAction
          textAction="건너뛰기"
          onTextActionPress={() => setSheetVisible(true)}
        />
        <OnboardingVisual height={visualHeight} page={page} step={step} />

        <View className={cn('relative h-[92px] px-screen-x', compact ? 'mt-s24' : 'mt-s8')}>
          <Animated.View
            accessibilityElementsHidden={page !== 1}
            importantForAccessibility={page === 1 ? 'auto' : 'no-hide-descendants'}
            className="gap-gutter"
            style={firstStyle}
          >
            <Text className="text-text-primary text-head2-bold">숨만 쉬어도 돈이 나간다.</Text>
            <Text className="text-text-primary text-body1-regular">
              {'나도 모르게 매달 계속되는\n자동결제까지 한눈에 파악하고 알려줘요.'}
            </Text>
          </Animated.View>
          <Animated.View
            accessibilityElementsHidden={page !== 2}
            importantForAccessibility={page === 2 ? 'auto' : 'no-hide-descendants'}
            className="absolute inset-x-screen-x top-0 gap-gutter"
            style={secondStyle}
          >
            <Text className="text-text-primary text-head2-bold">내 구독의 호흡을 살펴보세요.</Text>
            <Text className="text-text-primary text-body1-regular">
              {'최근 이용 경험을 확인하고, 다음 결제 전에\n계속 이용할지 결정하게 도와줘요.'}
            </Text>
          </Animated.View>
        </View>

        <View className="flex-1 justify-end px-screen-x pb-s16">
          <Cta
            label={page === 1 ? '다음' : '시작하기'}
            onPress={() => (page === 1 ? goTo(2) : setSheetVisible(true))}
          />
        </View>
      </SafeAreaView>

      {sheetVisible && (
        <NotificationSheet onAllow={() => finish(true)} onLater={() => finish(false)} />
      )}
    </View>
  );
};
