import LottieView from 'lottie-react-native';
import { useEffect, useRef } from 'react';
import { AppState, Pressable, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useReducedMotion,
} from 'react-native-reanimated';

import bellRing from '@/assets/animations/bell_ring.json';
import { Cta } from '@/components/common/Cta';

const SHEET_ENTER_MS = 300;
const BELL_LAST_FRAME = 336;
// LottieView는 className 타입이 없어서 style로 넘김 (Lottie 캔버스 크기)
const bellStyle = { width: 160, height: 136 };

interface NotificationSheetProps {
  onAllow: () => void;
  onLater: () => void;
}

// 딤을 눌러도 닫히지 않아야 해서 gorhom 모달 대신 화면 위에 직접 올림
export const NotificationSheet = ({ onAllow, onLater }: NotificationSheetProps) => {
  const bell = useRef<LottieView>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const reduceMotion = useReducedMotion();

  // 종 울림은 0.4초 대기까지 JSON에 들어 있어서, 시트가 다 올라온 순간부터 한 번 재생 (동작 줄이기면 정지)
  const settle = () => {
    clearTimeout(timer.current);
    bell.current?.play(BELL_LAST_FRAME, BELL_LAST_FRAME);
  };

  useEffect(() => {
    if (reduceMotion) return;
    timer.current = setTimeout(() => bell.current?.play(), SHEET_ENTER_MS);
    // 백그라운드에서 돌아오면 튀지 않게 마지막 프레임으로
    const sub = AppState.addEventListener('change', (state) => state === 'active' && settle());
    return () => {
      clearTimeout(timer.current);
      sub.remove();
    };
  }, [reduceMotion]);

  return (
    <View accessibilityViewIsModal className="absolute inset-0 justify-end">
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(250)}
        className="absolute inset-0 bg-bg-dim"
      />
      <Animated.View
        entering={SlideInDown.duration(SHEET_ENTER_MS)}
        exiting={SlideOutDown.duration(250)}
        className="items-center rounded-t-sheet bg-bg-default px-screen-x pb-s40"
      >
        <View className="mt-s20 h-[5px] w-[54px] rounded-full bg-icon-secondary" />
        {/* 160 × 136 캔버스 안에 108 종이 들어 있음 (흔들려도 안 잘리게 둔 여백만큼 위·아래 마진을 보정) */}
        <View
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          className="-mb-s12 mt-[41px]"
        >
          <LottieView
            ref={bell}
            source={bellRing}
            autoPlay={false}
            loop={false}
            style={bellStyle}
          />
        </View>
        <View className="mt-s20 items-center gap-inline-sm">
          <Text accessibilityRole="header" className="text-text-primary text-head3-bold">
            결제 3일 전에 알려드릴게요.
          </Text>
          <Text className="text-center text-text-primary text-body2-regular">
            {'결제 전에 최근 이용 경험을 확인하고,\n계속 이용할지 결정할 수 있어요.'}
          </Text>
        </View>
        <View className="mt-s24 w-full gap-stack-md">
          {/* OS 권한 팝업이 뜨는 동안에는 종을 마지막 프레임에 멈춰 둠 */}
          <Cta
            label="알림 받기"
            onPress={() => {
              settle();
              onAllow();
            }}
          />
          <Pressable
            accessibilityRole="button"
            hitSlop={12}
            onPress={onLater}
            className="items-center active:opacity-pressed"
          >
            <Text className="text-text-tertiary text-caption1-regular">다음에 설정하기</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
};
