import { router, Stack } from 'expo-router';
import { useEffect } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';

import { Cta } from '@/components/common/Cta';
import { StatusBlurBackground } from '@/components/common/StatusBlurBackground';
import { TopBar } from '@/components/common/TopBar';
import { SparklingStarsIcon } from '@/components/mypage/SparklingStarsIcon';

const TITLE = '새는 돈이 또 보이면\n그때 다시 불러주세요';

// 탈퇴가 끝난 상태라 탈퇴 확인으로 돌아가지 않고 로그인 화면으로
// shortcut: 확인 이후 이동(로그인 화면 / 앱 종료) 미정, 정해지면 교체
// 쌓인 계정 화면(마이페이지·탈퇴)을 비워 로그인에서 스와이프로 돌아가지 않게
const leave = () => {
  router.dismissAll();
  router.replace('/login');
};

// E-9 회원 탈퇴 완료
export const MypageWithdrawDoneScreen = () => {
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(TITLE.replace('\n', ' '));
  }, []);

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      {/* 스와이프로 탈퇴 확인 화면에 돌아가지 않게 */}
      <Stack.Screen options={{ gestureEnabled: false }} />
      <StatusBlurBackground tone="success" />
      <TopBar
        variant="detail"
        title="회원 탈퇴"
        onBack={leave}
        showAction1={false}
        showAction2={false}
      />
      {/* 아이콘 y 316, 제목 y 440 (상태바 44 + Top bar 56 기준), 블러 흰 영역과 같은 자리 */}
      <View className="flex-1 items-center gap-screen-x pt-[216px]">
        <SparklingStarsIcon />
        <Text className="text-center text-text-primary text-head3-bold">{TITLE}</Text>
      </View>
      <View className="pb-safe px-screen-x">
        <Cta label="확인" onPress={leave} className="mb-[14px]" />
      </View>
    </View>
  );
};
