import { useMutationState } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import {
  type NativeStackNavigationProp,
  router,
  useNavigation,
  useRootNavigationState,
} from 'expo-router';
import LottieView from 'lottie-react-native';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, View } from 'react-native';

import { Cta } from '@/components/common/Cta';
import { ListItem } from '@/components/common/ListItem';
import { Text } from '@/components/common/Text';
import { TopBar } from '@/components/common/TopBar';
import { FadeScrollView } from '@/components/register/FadeScrollView';
import { serviceLogo } from '@/constants/services';
import { type CreatedSubscriptions, createSubscriptionsKey } from '@/hooks/useCreateSubscriptions';
import { useRegisterDraft } from '@/hooks/useRegisterDraft';
import { CYCLE_UNIT, PAID_AT_OF } from '@/utils/apiCodes';
import { parseDate } from '@/utils/date';
import { formatPaymentSummary, formatWon } from '@/utils/formatPayment';

const HAPTIC_MS = 880;

interface NavState {
  index?: number;
  routes: { name: string; state?: NavState }[];
}

// 탭 내비게이터 상태. 루트 아래 몇 겹에 있을지 몰라 깊이 상관없이 찾음
const findTabs = (state?: NavState): NavState | undefined => {
  for (const route of state?.routes ?? []) {
    if (route.name === '(tabs)') return route.state;
    const found = findTabs(route.state);
    if (found) return found;
  }
};

export const RegisterDoneScreen = () => {
  // 서버가 저장한 마지막 등록 결과로 그림 (설계서: 최종 저장된 구독 개수·정보)
  const created = useMutationState({
    filters: { mutationKey: createSubscriptionsKey, status: 'success' },
    select: (m) => m.state.data as CreatedSubscriptions,
  }).at(-1);
  const subscriptions = created?.subscriptions ?? [];
  // 등록이 끝났으니 저장소는 바로 비움 (나간 뒤 불러오기 팝업이 뜨지 않게)
  useEffect(() => {
    useRegisterDraft.getState().reset();
  }, []);
  // 구독 관리 탭(M-01·M-02)에서 들어왔으면 거기로, 그 외(홈·온보딩)는 홈 H-02로 (설계서)
  // 들어온 시점의 탭으로 판단 (이후 렌더에선 탭 상태가 다시 그려지며 바뀔 수 있음)
  const tabs = findTabs(useRootNavigationState());
  const [fromManage] = useState(() => tabs?.routes[tabs.index ?? 0]?.name === 'manage');
  // 등록 화면을 모두 닫고(탭으로 돌아가면 홈 탭이 됨) 구독 관리였으면 그 탭으로
  const finish = () => {
    router.dismissTo('/');
    if (fromManage) router.navigate('/manage');
  };
  const navigation = useNavigation<NativeStackNavigationProp<Record<string, undefined>>>();
  const lottieRef = useRef<LottieView>(null);
  const [lastFrame, setLastFrame] = useState<number>();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const unsubscribe = navigation.addListener('transitionEnd', async (e) => {
      if (e.data.closing) return;
      if (await AccessibilityInfo.isReduceMotionEnabled()) return setLastFrame(1);
      lottieRef.current?.play();
      timer = setTimeout(
        () => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
        HAPTIC_MS,
      );
    });
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [navigation]);

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <View
        pointerEvents="none"
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        className="pt-safe absolute inset-x-0 top-0 items-center"
      >
        <LottieView
          ref={lottieRef}
          source={require('@/assets/animations/piggy_coin.json')}
          autoPlay={false}
          loop={false}
          progress={lastFrame}
          className="-mt-[164px] h-[932px] w-[480px]"
        />
      </View>
      <TopBar
        variant="detail"
        title="등록 완료"
        onBack={finish}
        showAction1={false}
        showAction2={false}
      />
      {/* 목록은 최대 434, CTA와 56 유지, 넘치면 내부 스크롤 + 하단 페이드 (Figma 주석) */}
      <View className="flex-1 gap-section px-screen-x pb-[56px] pt-s20">
        <View className="items-center gap-inset-md">
          <View className="size-[118px]" />
          <View className="items-center gap-s2">
            <Text className="text-center text-text-primary text-head3-bold">
              구독을 등록했어요.
            </Text>
            <Text className="text-center text-text-primary text-body2-regular">
              이제 결제 일정과 구독 정보를 확인할 수 있어요.
            </Text>
          </View>
        </View>
        <View className="shrink gap-stack-md">
          <Text className="px-s2 text-text-primary text-body3-semibold">
            등록된 구독{' '}
            <Text className="text-text-brand text-body3-bold">{subscriptions.length}</Text>
          </Text>
          <FadeScrollView className="max-h-[434px] shrink" contentContainerClassName="gap-stack-sm">
            {/* 항목 터치 불가 (설계서) */}
            {subscriptions.map((s) => (
              <ListItem
                key={s.subscriptionId}
                title={s.serviceName}
                subtitle={formatPaymentSummary({
                  category: '',
                  amount: s.amount,
                  cycle: s.billingCycleValue,
                  unit: CYCLE_UNIT[s.billingCycleUnit],
                  nextDate: parseDate(s.nextBillingDate),
                  paidAt: PAID_AT_OF[s.paymentMethod],
                })}
                showSubtitle
                logo={serviceLogo(s.logoUrl ?? undefined)}
                showLogo
                cost={formatWon(s.amount)}
                showCost
              />
            ))}
          </FadeScrollView>
        </View>
      </View>
      <View className="pb-safe px-screen-x">
        <Cta testID="register-done" label="확인" onPress={finish} className="mb-[14px]" />
      </View>
    </View>
  );
};
