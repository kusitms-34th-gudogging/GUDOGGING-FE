import { useRef, useState } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { SocialLoginButton } from '@/components/common/SocialLoginButton';
import { LOGIN_TRANSITION_SEC, LoginBackdrop } from '@/components/login/LoginBackdrop';

type LoginProvider = 'apple' | 'google';

interface LoginScreenProps {
  /** 로그인 요청. reject되면 L-01로 되돌림 */
  onLogin?: (provider: LoginProvider) => Promise<void>;
  /** 로그인 성공 후 화면이 사라지고 나면 (온보딩 등 다음 화면으로 이동) */
  onLoggedIn?: () => void;
}

const EXIT_SEC = 0.3;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const LoginScreen = ({ onLogin, onLoggedIn }: LoginScreenProps) => {
  const progress = useSharedValue(0);
  const exit = useSharedValue(0);
  const reduceMotion = useReducedMotion();
  const locked = useRef(false);
  const [loading, setLoading] = useState(false);

  const idleTextStyle = useAnimatedStyle(() => ({
    opacity: 1 - Math.min(1, progress.value / 0.2),
  }));
  const loadingTextStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.max(0, (progress.value - 0.15) / 0.25)),
  }));

  // 동작 줄이기: 위치 이동 없이 색·문구만 0.2초 크로스페이드 (이동은 Backdrop에서 제외)
  const transitionMs = reduceMotion ? 200 : LOGIN_TRANSITION_SEC * 1000;
  const animateTo = (value: number) => {
    progress.value = withTiming(value, { duration: transitionMs, easing: Easing.linear });
  };
  const rootStyle = useAnimatedStyle(() => ({ opacity: 1 - exit.value }));

  const handleLogin = async (provider: LoginProvider) => {
    if (locked.current) return;
    locked.current = true;
    setLoading(true);
    AccessibilityInfo.announceForAccessibility('로그인하고 있어요');
    animateTo(LOGIN_TRANSITION_SEC);
    const startedAt = Date.now();

    try {
      await onLogin?.(provider);
      // 응답이 전환보다 빨라도 전환을 끝까지 보여 준 뒤 사라짐
      await sleep(Math.max(0, transitionMs - (Date.now() - startedAt)));
      // 갈 곳이 없으면 사라지지 않고 L-02에 머문다 (빈 화면 방지)
      if (!onLoggedIn) return;
      exit.value = withTiming(
        1,
        { duration: EXIT_SEC * 1000, easing: Easing.out(Easing.cubic) },
        (finished) => {
          if (finished) scheduleOnRN(onLoggedIn);
        },
      );
    } catch {
      animateTo(0);
      setLoading(false);
      locked.current = false;
    }
  };

  return (
    <Animated.View
      className="flex-1 justify-end overflow-hidden bg-bg-default pb-home-indicator"
      style={rootStyle}
    >
      <LoginBackdrop progress={progress} />

      <View className="px-screen-x">
        <Animated.View
          accessibilityElementsHidden={loading}
          importantForAccessibility={loading ? 'no-hide-descendants' : 'auto'}
          className="gap-gutter"
          style={idleTextStyle}
        >
          <Text className="text-text-primary text-head2-bold">
            {'구독 사이에\n나를 돌아보는 시간'}
          </Text>
          <Text className="text-text-primary text-body1-regular">
            {'매달 이어지는 구독 속에서,\n내가 얼마나 이용하고 만족했는지 살펴보세요.'}
          </Text>
        </Animated.View>
        <Animated.View
          accessibilityElementsHidden={!loading}
          importantForAccessibility={loading ? 'auto' : 'no-hide-descendants'}
          className="absolute inset-x-screen-x bottom-0 gap-gutter"
          style={loadingTextStyle}
        >
          <Text className="text-text-primary text-head2-bold">로그인하고 있어요</Text>
          <Text className="text-text-primary text-body1-regular">잠시만 기다려 주세요.</Text>
        </Animated.View>
      </View>

      <View className="gap-inline-sm px-screen-x pb-s16 pt-[66px]">
        <View className="gap-stack-md">
          <SocialLoginButton provider="apple" onPress={() => handleLogin('apple')} />
          <SocialLoginButton provider="google" onPress={() => handleLogin('google')} />
        </View>
        <Text className="text-center text-text-tertiary text-caption2-regular">
          이용약관 및 개인정보 처리방침
        </Text>
      </View>
    </Animated.View>
  );
};
