import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';

import { AnalyzeColorAsset } from '@/assets/graphics';
import { TopBar } from '@/components/common/TopBar';

const MESSAGE = '구독 정보를 찾고 있어요.';

export const RegisterAnalyzeScreen = () => {
  const [reduceMotion, setReduceMotion] = useState<boolean>();

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    AccessibilityInfo.announceForAccessibility(MESSAGE);
  }, []);

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <View
        pointerEvents="none"
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        className="pt-safe absolute inset-x-0 top-0 items-center"
      >
        <View className="-mt-[44px] h-[812px] w-[480px]">
          {reduceMotion === false && (
            <LottieView
              source={require('@/assets/lotties/category_pull.json')}
              autoPlay
              loop
              className="size-full"
            />
          )}
          {reduceMotion && (
            <AnalyzeColorAsset className="absolute left-[188px] top-[316px] size-[104px]" />
          )}
        </View>
      </View>
      <TopBar
        variant="detail"
        title="구독 정보 확인 중"
        onBack={() => router.back()}
        showAction1={false}
        showAction2={false}
      />
      <Text className="pt-[341px] text-center text-text-primary text-head3-bold">{MESSAGE}</Text>
    </View>
  );
};
