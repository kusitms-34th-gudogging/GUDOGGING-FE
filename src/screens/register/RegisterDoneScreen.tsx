import * as Haptics from 'expo-haptics';
import { type NativeStackNavigationProp, router, useNavigation } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, ScrollView, Text, View } from 'react-native';

import { Cta } from '@/components/common/Cta';
import { ListItem } from '@/components/common/ListItem';
import { TopBar } from '@/components/common/TopBar';
import { getRegisteredServices, useRegisterDraft } from '@/hooks/useRegisterDraft';
import { formatPaymentSummary, formatWon } from '@/utils/formatPayment';

interface RegisterDoneScreenProps {
  serviceIds: string[];
}

const HAPTIC_MS = 880;

export const RegisterDoneScreen = ({ serviceIds }: RegisterDoneScreenProps) => {
  // 들어온 시점의 값으로 그리고, 등록이 끝났으니 저장소는 바로 비움 (나간 뒤 불러오기 팝업이 뜨지 않게)
  const [{ payments, services }] = useState(() => {
    const { payments } = useRegisterDraft.getState();
    return { payments, services: getRegisteredServices(serviceIds, payments) };
  });
  useEffect(() => {
    useRegisterDraft.getState().reset();
  }, []);
  const finish = () => router.dismissTo('/');
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
        () => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
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
          source={require('@/assets/lotties/piggy_coin.json')}
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
      <View className="flex-1 gap-inset-lg px-screen-x pt-s20">
        <View className="items-center gap-screen-x">
          <View className="size-[118px]" />
          <View className="items-center gap-s4">
            <Text className="text-center text-text-primary text-head3-bold">
              구독을 등록했어요.
            </Text>
            <Text className="text-center text-text-primary text-body2-regular">
              이제 결제 일정과 구독 정보를 확인할 수 있어요.
            </Text>
          </View>
        </View>
        <View className="shrink gap-inline-sm">
          <Text className="text-text-primary text-body3-semibold">
            등록된 구독 {services.length}
          </Text>
          <ScrollView className="max-h-[316px] shrink" contentContainerClassName="gap-inline-xs">
            {services.map((s) => {
              const payment = payments[s.id];
              return (
                <ListItem
                  key={s.id}
                  title={s.name}
                  subtitle={payment && formatPaymentSummary(payment)}
                  showSubtitle
                  logo={require('@/assets/images/logo_placeholder.png')}
                  showLogo
                  cost={payment && formatWon(payment.amount)}
                  showCost
                />
              );
            })}
          </ScrollView>
        </View>
      </View>
      <View className="pb-safe px-screen-x">
        <Cta label="확인" onPress={finish} className="mb-[14px]" />
      </View>
    </View>
  );
};
