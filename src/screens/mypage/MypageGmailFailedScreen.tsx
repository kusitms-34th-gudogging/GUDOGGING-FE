import { router } from 'expo-router';
import { useEffect } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';

import { AlertBlurBackground } from '@/components/common/AlertBlurBackground';
import { Button } from '@/components/common/Button';
import { ShakingAlertIcon } from '@/components/common/ShakingAlertIcon';
import { TopBar } from '@/components/common/TopBar';

const TITLE = 'Gmail을 연결하지 못했어요.';

// E-04 Gmail 연동 실패
export const MypageGmailFailedScreen = () => {
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(TITLE);
  }, []);

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <AlertBlurBackground />
      <TopBar
        variant="detail"
        title="Gmail 연동"
        onBack={() => router.back()}
        showAction1={false}
        showAction2={false}
      />
      {/* 아이콘 y 316 (상태바 44 + Top bar 56 기준), 블러 흰 영역과 같은 자리 */}
      <View className="flex-1 items-center gap-screen-x pt-[216px]">
        <ShakingAlertIcon />
        <Text className="text-center text-text-primary text-head3-bold">{TITLE}</Text>
      </View>
      <View className="pb-safe px-screen-x">
        <View className="mb-[14px] flex-row gap-inline-sm">
          <Button variant="tonal" label="확인" onPress={() => router.back()} className="flex-1" />
          {/* shortcut: Gmail OAuth 없음, 연동 작업 시 OAuth 다시 요청 */}
          <Button label="다시 시도하기" onPress={() => router.back()} className="flex-1" />
        </View>
      </View>
    </View>
  );
};
