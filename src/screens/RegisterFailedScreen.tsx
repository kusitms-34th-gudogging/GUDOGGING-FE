import { router } from 'expo-router';
import { useEffect } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';

import { Cta } from '@/components/common/Cta';
import { TopBar } from '@/components/common/TopBar';
import { AlertBlurBackground } from '@/components/register/AlertBlurBackground';
import { ShakingAlertIcon } from '@/components/register/ShakingAlertIcon';

// A-08e 스크린샷·A-12e Gmail이 모션은 같고 문구만 다름
const COPY = {
  screenshot: {
    header: '스크린샷으로 등록',
    title: '구독 정보를 찾지 못했어요.',
    description: '구독 목록이 잘 보이지 않거나\n지원하지 않는 화면일 수 있어요.',
  },
  gmail: {
    header: 'Gmail에서 불러오기',
    title: '결제 메일을 읽지 못했어요.',
    description: '결제 메일 형식이 달라\n구독 정보를 가져오지 못했어요.',
  },
};

interface RegisterFailedScreenProps {
  source: keyof typeof COPY;
}

export const RegisterFailedScreen = ({ source }: RegisterFailedScreenProps) => {
  const { header, title, description } = COPY[source];

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(`${title} ${description}`);
  }, [title, description]);

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <AlertBlurBackground />
      <TopBar
        variant="detail"
        title={header}
        onBack={() => router.back()}
        showAction1={false}
        showAction2={false}
      />
      {/* 확인 중 화면과 같은 자리: 아이콘 y 316, 제목 y 441, 설명 y 477 (상태바 44 + Top bar 56 기준) */}
      <View className="flex-1 items-center pt-[216px]">
        <ShakingAlertIcon />
        <View className="mt-[21px] items-center gap-stack-sm">
          <Text className="text-center text-text-primary text-head3-bold">{title}</Text>
          <Text className="text-center text-text-primary text-body2-regular">{description}</Text>
        </View>
      </View>
      <View className="pb-safe px-screen-x">
        <Cta
          label="직접 등록하기"
          onPress={() => router.push('/register/select')}
          className="mb-[14px]"
        />
      </View>
    </View>
  );
};
