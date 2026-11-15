import { router } from 'expo-router';
import { useEffect } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { ShakingAlertIcon } from '@/components/common/ShakingAlertIcon';
import { StatusBlurBackground } from '@/components/common/StatusBlurBackground';
import { TopBar } from '@/components/common/TopBar';

// E-04 Gmail 연동 실패 · E-10 회원 탈퇴 실패: 배치·모션은 같고 문구·버튼만 다름
// 다시 시도하기는 직전 화면(Gmail 연동·회원 탈퇴)으로 돌아가 다시 누르게 함
// shortcut: 연동·탈퇴 API 없음, 연동 작업 시 이 화면에서 바로 다시 요청
const COPY = {
  gmail: {
    header: 'Gmail 연동',
    title: 'Gmail을 연결하지 못했어요.',
    cancelLabel: '확인',
    onCancel: () => router.back(),
  },
  withdraw: {
    header: '회원 탈퇴',
    title: '회원 탈퇴에 실패했어요.',
    cancelLabel: '취소하기',
    // 탈퇴를 그만두면 마이페이지로
    onCancel: () => router.dismissTo('/mypage'),
  },
};

interface MypageFailedScreenProps {
  kind: keyof typeof COPY;
}

export const MypageFailedScreen = ({ kind }: MypageFailedScreenProps) => {
  const { header, title, cancelLabel, onCancel } = COPY[kind];

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(title);
  }, [title]);

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <StatusBlurBackground />
      <TopBar
        variant="detail"
        title={header}
        onBack={() => router.back()}
        showAction1={false}
        showAction2={false}
      />
      {/* 아이콘 y 316 (상태바 44 + Top bar 56 기준), 블러 흰 영역과 같은 자리 */}
      <View className="flex-1 items-center gap-screen-x pt-[216px]">
        <ShakingAlertIcon />
        <Text className="text-center text-text-primary text-head3-bold">{title}</Text>
      </View>
      <View className="pb-safe px-screen-x">
        <View className="mb-[14px] flex-row gap-inline-sm">
          <Button variant="tonal" label={cancelLabel} onPress={onCancel} className="flex-1" />
          <Button label="다시 시도하기" onPress={() => router.back()} className="flex-1" />
        </View>
      </View>
    </View>
  );
};
